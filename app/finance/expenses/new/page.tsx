'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = ['Fuel', 'Insurance', 'Maintenance', 'Repairs', 'Car Wash', 'Parking', 'Registration', 'Other']

export default function NewExpense() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [form, setForm] = useState({
    vehicle_id: '', category: 'Fuel', description: '',
    amount: '', date: new Date().toISOString().split('T')[0], vendor: '',
  })
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, vehicle_id: form.vehicle_id ? parseInt(form.vehicle_id) : null, amount: parseFloat(form.amount) }),
    })
    if (!res.ok) { const { error } = await res.json(); alert(error); setLoading(false); return }
    router.push('/finance')
  }

  return (
    <div className="flex flex-col gap-6 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Vehicle <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span>
          </label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} className="input-dark">
            <option value="">No specific vehicle (overhead)</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-dark">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {[
          { label: 'Description', name: 'description', type: 'text',   placeholder: 'e.g. Oil change at Jiffy Lube', required: true },
          { label: 'Amount (CAD)',name: 'amount',      type: 'number', placeholder: '89.99',                        required: true },
          { label: 'Date',        name: 'date',        type: 'date',   placeholder: '',                             required: true },
          { label: 'Vendor',      name: 'vendor',      type: 'text',   placeholder: 'e.g. Shell, Canadian Tire',    required: false },
        ].map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {field.label}{!field.required && <span style={{ color: 'rgba(255,255,255,0.2)' }}> (optional)</span>}
            </label>
            <input
              name={field.name} type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange} placeholder={field.placeholder}
              required={field.required}
              className="input-dark"
            />
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn-primary py-4 text-[15px] mt-2">
          {loading ? 'Saving…' : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
