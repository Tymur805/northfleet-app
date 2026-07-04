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

const maintenanceTypes = ['Oil Change', 'Tire Change', 'Brake Pads', 'Inspection', 'Battery', 'Other']

export default function NewMaintenance() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({
    vehicle_id: '', type: 'Oil Change',
    date: new Date().toISOString().split('T')[0],
    mileage_km: '', cost: '', notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('vehicles').select('*').then(({ data }: { data: any }) => {
      if (data) setVehicles(data)
      if (data?.[0]) setForm(f => ({ ...f, vehicle_id: String(data[0].id) }))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleVoiceFill(fields: Record<string, string>) {
    setForm(f => ({
      ...f,
      ...(fields.type        ? { type:        fields.type }        : {}),
      ...(fields.date        ? { date:        fields.date }        : {}),
      ...(fields.mileage_km  ? { mileage_km:  fields.mileage_km }  : {}),
      ...(fields.cost        ? { cost:        fields.cost }        : {}),
      ...(fields.notes       ? { notes:       fields.notes }       : {}),
      ...(fields.vehicle_id  ? { vehicle_id:  fields.vehicle_id }  : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, vehicle_id: parseInt(form.vehicle_id), mileage_km: parseFloat(form.mileage_km), cost: parseFloat(form.cost) }),
    })
    if (!res.ok) { const { error } = await res.json(); alert(error); setLoading(false); return }
    router.push('/maintenance')
  }

  return (
    <div className="flex flex-col gap-5 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href="/maintenance" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Log Service</h1>
      </div>

      <VoiceFill formType="maintenance" vehicles={vehicles} onFill={handleVoiceFill} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Vehicle</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required className="input-dark">
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}{v.nickname ? ` (${v.nickname})` : ''}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Service Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="input-dark">
            {maintenanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {[
          { label: 'Date',        name: 'date',       type: 'date',   placeholder: '' },
          { label: 'Mileage (km)',name: 'mileage_km', type: 'number', placeholder: '45000' },
          { label: 'Cost (CAD)',  name: 'cost',       type: 'number', placeholder: '89.99' },
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
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Notes <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span>
          </label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            placeholder="e.g. Used Mobil 1 5W-30" rows={2}
            className="input-dark resize-none" style={{ borderRadius: 14, padding: '14px 16px' }} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary py-4 text-[15px] mt-2">
          {loading ? 'Saving…' : 'Log Service'}
        </button>
      </form>
    </div>
  )
}
