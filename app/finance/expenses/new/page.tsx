'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = ['Fuel', 'Insurance', 'Maintenance', 'Repairs', 'Car Wash', 'Parking', 'Registration', 'Other']

export default function NewExpense() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({
    vehicle_id: '',
    category: 'Fuel',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
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
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        vehicle_id: form.vehicle_id ? parseInt(form.vehicle_id) : null,
        amount: parseFloat(form.amount),
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error)
      setLoading(false)
      return
    }
    router.push('/finance')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Add Expense</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-400">Vehicle <span className="text-zinc-600">(optional)</span></label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500">
            <option value="">No specific vehicle (overhead)</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-400">Category</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {[
          { label: 'Description', name: 'description', type: 'text', placeholder: 'e.g. Oil change at Jiffy Lube' },
          { label: 'Amount (CAD)', name: 'amount', type: 'number', placeholder: '89.99' },
          { label: 'Date', name: 'date', type: 'date', placeholder: '' },
          { label: 'Vendor', name: 'vendor', type: 'text', placeholder: 'e.g. Shell, Canadian Tire' },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-400">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.name !== 'vendor'}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>
        ))}

        <button type="submit" disabled={loading}
          className="mt-2 rounded-full bg-white text-black font-semibold py-3 transition-opacity hover:opacity-80 disabled:opacity-50">
          {loading ? 'Saving...' : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
