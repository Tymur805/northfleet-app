'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditVehicle() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ make: '', model: '', year: '', color: '', license_plate: '', nickname: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    fetch(`${url}/rest/v1/vehicles?id=eq.${id}&select=*`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) {
        const v = data[0]
        setForm({ make: v.make || '', model: v.model || '', year: String(v.year || ''), color: v.color || '', license_plate: v.license_plate || '', nickname: v.nickname || '' })
      }
    }).finally(() => setLoading(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    await fetch(`${url}/rest/v1/vehicles?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ ...form, year: parseInt(form.year) }),
    })
    router.push(`/vehicles/${id}`)
  }

  const fields = [
    { label: 'Nickname',      name: 'nickname',      placeholder: 'e.g. Milano',   required: false },
    { label: 'Make',          name: 'make',          placeholder: 'Hyundai',        required: true },
    { label: 'Model',         name: 'model',         placeholder: 'Elantra',        required: true },
    { label: 'Year',          name: 'year',          placeholder: '2022',           required: true },
    { label: 'Color',         name: 'color',         placeholder: 'White',          required: true },
    { label: 'License Plate', name: 'license_plate', placeholder: 'ABCD 123',       required: true },
  ]

  return (
    <div className="flex flex-col gap-6 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href={`/vehicles/${id}`} className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Edit Vehicle</h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-[14px]" />)}
        </div>
      ) : (
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

          <button type="submit" disabled={saving} className="btn-primary py-4 text-[15px] mt-2">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  )
}
