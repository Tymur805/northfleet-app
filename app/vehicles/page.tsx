'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import VehicleSearch from '../components/VehicleSearch'

export default function VehiclesPage() {
  const [vehiclesWithEarnings, setVehiclesWithEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }

    Promise.all([
      fetch(`${url}/rest/v1/vehicles?select=*&order=year.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Trips?select=vehicle_id,earnings`, { headers: h }).then(r => r.json()),
    ]).then(([vehiclesData, tripsData]) => {
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : []
      const trips = Array.isArray(tripsData) ? tripsData : []
      const earningsByVehicle: Record<number, number> = {}
      trips.forEach((t: any) => {
        earningsByVehicle[t.vehicle_id] = (earningsByVehicle[t.vehicle_id] ?? 0) + Number(t.earnings)
      })
      setVehiclesWithEarnings(vehicles.map((v: any) => ({ ...v, totalEarned: earningsByVehicle[v.id] ?? 0 })))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fleet</h1>
        <Link href="/vehicles/new" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg hover:opacity-80 transition-opacity">+</Link>
      </div>
      {loading ? (
        <div className="text-center py-16 text-zinc-600">Loading...</div>
      ) : (
        <VehicleSearch vehicles={vehiclesWithEarnings} />
      )}
    </div>
  )
}
