'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import VehicleSearch from '../components/VehicleSearch'

export default function VehiclesPage() {
  const [vehiclesWithStats, setVehiclesWithStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }

    Promise.all([
      fetch(`${url}/rest/v1/vehicles?select=*&order=year.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Trips?select=vehicle_id,earnings,start_date,end_date`, { headers: h }).then(r => r.json()),
    ]).then(([vehiclesData, tripsData]) => {
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : []
      const trips = Array.isArray(tripsData) ? tripsData : []

      const today = new Date().toISOString().split('T')[0]
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

      const result = vehicles.map((v: any) => {
        const vTrips = trips.filter((t: any) => t.vehicle_id === v.id)
        const totalEarned = vTrips.reduce((s: number, t: any) => s + Number(t.earnings), 0)

        // Count rented days in last 30 days
        let rentedDays = 0
        for (const t of vTrips) {
          const start = t.start_date > thirtyDaysAgo ? t.start_date : thirtyDaysAgo
          const end = t.end_date < today ? t.end_date : today
          if (start <= end) {
            const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
            rentedDays += diff + 1
          }
        }
        const utilization30 = Math.min(100, Math.round((rentedDays / 30) * 100))
        const activeNow = vTrips.some((t: any) => t.start_date <= today && t.end_date >= today)

        return { ...v, totalEarned, utilization30, activeNow }
      })

      setVehiclesWithStats(result)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-2 animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[13px] font-semibold text-white">Fleet</h1>
        <Link href="/vehicles/new" className="pressable h-8 px-3 rounded-full text-sm font-medium flex items-center gap-1.5"
          style={{ background: '#0A84FF', color: 'white', boxShadow: '0 0 16px rgba(10,132,255,0.3)' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-16 text-zinc-600">Loading...</div>
      ) : (
        <VehicleSearch vehicles={vehiclesWithStats} />
      )}
    </div>
  )
}
