'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }

    Promise.all([
      fetch(`${url}/rest/v1/vehicles?select=*`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Trips?select=*`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Maintenance?select=*&order=date.desc`, { headers: h }).then(r => r.json()),
    ])
      .then(([v, t, m]) => {
        setVehicles(Array.isArray(v) ? v : [])
        setTrips(Array.isArray(t) ? t : [])
        setMaintenance(Array.isArray(m) ? m : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

  const activeTrips = trips.filter(t => t.start_date <= today && t.end_date >= today)
  const returningTrips = trips.filter(t => t.end_date >= today && t.end_date <= dayAfter && t.start_date <= today)
  const totalEarnings = trips.reduce((sum, t) => sum + Number(t.earnings), 0)

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))

  // Last maintenance per vehicle
  const lastMaintenanceByVehicle: Record<number, any> = {}
  maintenance.forEach(m => {
    if (!lastMaintenanceByVehicle[m.vehicle_id]) lastMaintenanceByVehicle[m.vehicle_id] = m
  })

  // Overdue: last oil change > 5000 km ago (rough alert)
  const overdueAlerts = maintenance
    .filter(m => m.type === 'Oil Change')
    .reduce((acc: any[], m) => {
      if (!acc.find((x: any) => x.vehicle_id === m.vehicle_id)) acc.push(m)
      return acc
    }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/vehicles" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicles.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Vehicles</p>
          </div>
        </Link>

        <Link href="/trips" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{loading ? '—' : activeTrips.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Active Trips</p>
          </div>
        </Link>
      </div>

      {/* Total earnings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Earnings</p>
        <p className="text-3xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
        <p className="text-xs text-zinc-600 mt-1">All time · CAD</p>
      </div>

      {/* Returning soon */}
      {!loading && returningTrips.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Returning Soon</p>
          {returningTrips.map((trip) => {
            const v = vehicleMap[trip.vehicle_id]
            const vehicleLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${trip.vehicle_id}`
            const returnsLabel = trip.end_date === today ? 'Today' : trip.end_date === tomorrow ? 'Tomorrow' : 'In 2 days'
            return (
              <div key={trip.id} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{trip.customer_name}</p>
                  <p className="text-sm text-amber-400 mt-0.5">{vehicleLabel}</p>
                </div>
                <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full">
                  Returns {returnsLabel}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Active trips */}
      {!loading && activeTrips.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Active Now</p>
          {activeTrips.map((trip) => {
            const v = vehicleMap[trip.vehicle_id]
            const vehicleLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${trip.vehicle_id}`
            return (
              <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{trip.customer_name}</p>
                  <p className="text-sm text-blue-400 mt-0.5">{vehicleLabel}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Returns {trip.end_date}</p>
                </div>
                <p className="text-green-400 font-semibold">${Number(trip.earnings).toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Maintenance alerts */}
      {!loading && overdueAlerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Last Service</p>
          {overdueAlerts.slice(0, 3).map((m: any) => {
            const v = vehicleMap[m.vehicle_id]
            const vehicleLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${m.vehicle_id}`
            return (
              <Link key={m.id} href="/maintenance" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between active:opacity-70">
                <div>
                  <p className="font-semibold text-white">{vehicleLabel}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">Last oil change: {m.date}</p>
                </div>
                <span className="text-xs font-semibold bg-zinc-700 text-zinc-400 px-2.5 py-1 rounded-full">
                  {m.mileage_km?.toLocaleString()} km
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
