'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VoiceFill from '../components/VoiceFill'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewTrip() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({ vehicle_id: '', start_date: '', end_date: '', earnings: '', customer_name: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('vehicles').select('*').then(({ data }: { data: any }) => {
      if (data) setVehicles(data)
      if (data?.[0]) setForm(f => ({ ...f, vehicle_id: String(data[0].id) }))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleVoiceFill(fields: Record<string, string>) {
    setForm(f => ({
      ...f,
      ...(fields.customer_name ? { customer_name: fields.customer_name } : {}),
      ...(fields.start_date    ? { start_date:    fields.start_date }    : {}),
      ...(fields.end_date      ? { end_date:      fields.end_date }      : {}),
      ...(fields.earnings      ? { earnings:      fields.earnings }      : {}),
      ...(fields.vehicle_id    ? { vehicle_id:    fields.vehicle_id }    : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, vehicle_id: parseInt(form.vehicle_id), earnings: parseFloat(form.earnings) }),
    })
    if (!res.ok) { const { error } = await res.json(); alert(error); setLoading(false); return }
    router.push('/trips')
  }

  return (
    <div className="flex flex-col gap-5 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href="/trips" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Log Trip</h1>
      </div>

      <VoiceFill formType="trip" vehicles={vehicles} onFill={handleVoiceFill} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Vehicle</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required className="input-dark">
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}{v.nickname ? ` (${v.nickname})` : ''}</option>
            ))}
          </select>
        </div>
        {[
          { label: 'Customer Name', name: 'customer_name', placeholder: 'John Smith',  type: 'text' },
          { label: 'Start Date',    name: 'start_date',    placeholder: '',            type: 'date' },
          { label: 'End Date',      name: 'end_date',      placeholder: '',            type: 'date' },
          { label: 'Earnings (CAD)',name: 'earnings',       placeholder: '320.00',     type: 'number' },
        ].map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{field.label}</label>
            <input
              name={field.name} type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange} placeholder={field.placeholder} required
              className="input-dark"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary py-4 text-[15px] mt-2">
          {loading ? 'Saving…' : 'Log Trip'}
        </button>
      </form>
    </div>
  )
}
