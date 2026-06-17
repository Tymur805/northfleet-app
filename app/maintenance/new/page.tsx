'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const maintenanceTypes = ['Oil Change', 'Tire Change', 'Brake Pads', 'Inspection', 'Battery', 'Other']

export default function NewMaintenance() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({
    vehicle_id: '',
    type: 'Oil Change',
    date: new Date().toISOString().split('T')[0],
    mileage_km: '',
    cost: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('vehicles').select('*').then(({ data }: { data: any }) => {
      if (data) setVehicles(data)
      if (data?.[0]) setForm((f) => ({ ...f, vehicle_id: String(data[0].id) }))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        mileage_km: parseFloat(form.mileage_km),
        cost: parseFloat(form.cost),
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error)
      setLoading(false)
      return
    }
    router.push('/maintenance')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Log Maintenance</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-400">Vehicle</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500">
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-400">Type</label>
          <select name="type" value={form.type} onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500">
            {maintenanceTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {[
          { label: 'Date', name: 'date', type: 'date' },
          { label: 'Mileage (km)', name: 'mileage_km', type: 'number', placeholder: '45000' },
          { label: 'Cost (CAD)', name: 'cost', type: 'number', placeholder: '89.99' },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-400">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.name !== 'notes'}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-400">Notes (optional)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="e.g. Used Mobil 1 5W-30"
            rows={2}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 placeholder:text-zinc-600 resize-none"
          />
        </div>

        <button type="submit" disabled={loading}
          className="mt-2 rounded-full bg-white text-black font-semibold py-3 transition-opacity hover:opacity-80 disabled:opacity-50">
          {loading ? 'Saving...' : 'Log Maintenance'}
        </button>
      </form>
    </div>
  )
}
