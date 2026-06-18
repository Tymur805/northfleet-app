'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const typeIcons: Record<string, string> = {
  'Oil Change': '🛢️',
  'Tire Change': '🔄',
  'Brake Pads': '🔧',
  'Inspection': '🔍',
  'Battery': '🔋',
  'Other': '⚙️',
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    fetch(`${url}/rest/v1/Maintenance?select=*&order=date.desc`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Maintenance</h1>
        <Link href="/maintenance/new" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg hover:opacity-80 transition-opacity">+</Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-600">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No maintenance records yet. Tap + to add one.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => (
            <div key={record.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
                  {typeIcons[record.type] ?? '⚙️'}
                </div>
                <div>
                  <p className="font-semibold text-white">{record.type}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">Vehicle #{record.vehicle_id}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{record.date} · {record.mileage_km} km</p>
                </div>
              </div>
              <p className="font-semibold text-white">${record.cost}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
