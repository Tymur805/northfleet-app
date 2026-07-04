'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewReminder() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', due_date: new Date().toISOString().split('T')[0], vehicle: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const existing = JSON.parse(localStorage.getItem('nf_reminders') || '[]')
      const reminder = { id: Date.now().toString(), title: form.title, due_date: form.due_date, vehicle: form.vehicle, done: false }
      localStorage.setItem('nf_reminders', JSON.stringify([...existing, reminder]))
    } catch {}
    router.push('/reminders')
  }

  return (
    <div className="flex flex-col gap-6 pt-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href="/reminders" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-white">Add Reminder</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {[
          { label: 'What to remind', name: 'title',    type: 'text', placeholder: 'e.g. Check tire pressure on BMW', required: true },
          { label: 'Due Date',       name: 'due_date', type: 'date', placeholder: '',                                required: true },
          { label: 'Vehicle',        name: 'vehicle',  type: 'text', placeholder: 'e.g. BMW X5 (optional)',          required: false },
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
          {loading ? 'Saving…' : 'Add Reminder'}
        </button>
      </form>
    </div>
  )
}
