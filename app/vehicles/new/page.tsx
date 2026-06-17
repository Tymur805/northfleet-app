'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewVehicle() {
  const router = useRouter()
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    nickname: '',
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('vehicles').insert({
      ...form,
      year: parseInt(form.year),
    })
    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push('/vehicles')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Add a Vehicle</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { label: 'Nickname', name: 'nickname', placeholder: 'e.g. Milano', required: false },
          { label: 'Make', name: 'make', placeholder: 'Hyundai', required: true },
          { label: 'Model', name: 'model', placeholder: 'Elantra', required: true },
          { label: 'Year', name: 'year', placeholder: '2022', required: true },
          { label: 'Color', name: 'color', placeholder: 'White', required: true },
          { label: 'License Plate', name: 'license_plate', placeholder: 'ABCD 123', required: true },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-400">
              {field.label} {!field.required && <span className="text-zinc-600">(optional)</span>}
            </label>
            <input
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-white text-black font-semibold py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}
