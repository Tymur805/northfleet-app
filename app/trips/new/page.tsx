'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewTrip() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({
    vehicle_id: '',
    start_date: '',
    end_date: '',
    earnings: '',
    customer_name: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('vehicles').select('*').then(({ data }: { data: any }) => {
      if (data) setVehicles(data)
      if (data?.[0]) setForm((f) => ({ ...f, vehicle_id: String(data[0].id) }))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        earnings: parseFloat(form.earnings),
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error)
      setLoading(false)
      return
    }
    router.push('/trips')
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-black dark:text-white">Add a Trip</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Vehicle</label>
          <select
            name="vehicle_id"
            value={form.vehicle_id}
            onChange={handleChange}
            required
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>

        {[
          { label: 'Customer Name', name: 'customer_name', placeholder: 'John Smith', type: 'text' },
          { label: 'Start Date', name: 'start_date', placeholder: '', type: 'date' },
          { label: 'End Date', name: 'end_date', placeholder: '', type: 'date' },
          { label: 'Earnings (CAD)', name: 'earnings', placeholder: '320.00', type: 'number' },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Trip'}
        </button>
      </form>
    </div>
  )
}
