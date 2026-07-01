'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TripsTabs from '../components/TripsTabs'

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }
    Promise.all([
      fetch(`${url}/rest/v1/Trips?select=*&order=start_date.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/vehicles?select=*`, { headers: h }).then(r => r.json()),
    ]).then(([t, v]) => {
      setTrips(Array.isArray(t) ? t : [])
      setVehicles(Array.isArray(v) ? v : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-3 pt-1 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-bold text-white">Trips</h1>
        <Link href="/trips/new" className="btn-primary h-9 px-4 text-[13px]">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Log Trip
        </Link>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-[20px]" />)}
        </div>
      ) : (
        <TripsTabs trips={trips} vehicles={vehicles} />
      )}
    </div>
  )
}
