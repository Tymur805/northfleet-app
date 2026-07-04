'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VoiceFill from '../components/VoiceFill'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewVehicle() {
  const router = useRouter()
  const [form, setForm] = useState({ make: '', model: '', year: '', color: '', license_plate: '', nickname: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleVoiceFill(fields: Record<string, string>) {
    setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(fields).filter(([k]) => k in f && fields[k])) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('vehicles').insert({ ...form, year: parseInt(form.year) })
    if (error) { alert(error.message); setLoading(false); return }
    router.push('/vehicles')
  }

  const fields = [
    { label: 'Nickname',      name: 'nickname',      placeholder: 'e.g. Milano',  required: false },
    { label: 'Make',          name: 'make',          placeholder: 'Toyota',        required: true },
    { label: 'Model',         name: 'model',         placeholder: 'Camry',         required: true },
    { label: 'Year',          name: 'year',          placeholder: '2022',          required: true },
    { label: 'Color',         name: 'color',         placeholder: 'White',         required: true },
    { label: 'License Plate', name: 'license_plate', placeholder: 'ABCD 123',      required: true },
  ]

  return (
    <div className="flex flex-col gap-5 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href="/vehicles" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Add Vehicle</h1>
      </div>

      <VoiceFill formType="vehicle" onFill={handleVoiceFill} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {fields.map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {field.label}{!field.required && <span style={{ color: 'rgba(255,255,255,0.2)' }}> (optional)</span>}
            </label>
            <input
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="input-dark"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary py-4 text-[15px] mt-2">
          {loading ? 'Saving…' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}
