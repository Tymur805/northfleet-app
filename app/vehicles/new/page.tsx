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
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8"
      >
        <h1 className="text-2xl font-bold text-black dark:text-white">Add a Vehicle</h1>

        {[
          { label: 'Make', name: 'make', placeholder: 'Hyundai' },
          { label: 'Model', name: 'model', placeholder: 'Elantra' },
          { label: 'Year', name: 'year', placeholder: '2022' },
          { label: 'Color', name: 'color', placeholder: 'White' },
          { label: 'License Plate', name: 'license_plate', placeholder: 'ABCD 123' },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {field.label}
            </label>
            <input
              name={field.name}
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
          {loading ? 'Saving...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}
