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
    ])
      .then(([tripsData, vehiclesData]) => {
        setTrips(Array.isArray(tripsData) ? tripsData : [])
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trips</h1>
        <Link href="/trips/new" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg hover:opacity-80 transition-opacity">+</Link>
      </div>
      {loading ? (
        <div className="text-center py-16 text-zinc-600">Loading...</div>
      ) : (
        <TripsTabs trips={trips} vehicles={vehicles} />
      )}
    </div>
  )
}
