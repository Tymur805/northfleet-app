'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }

    Promise.all([
      fetch(`${url}/rest/v1/vehicles?id=eq.${id}&select=*`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Trips?vehicle_id=eq.${id}&select=*&order=start_date.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/Maintenance?vehicle_id=eq.${id}&select=*&order=date.desc`, { headers: h }).then(r => r.json()),
    ])
      .then(([vData, tData, mData]) => {
        setVehicle(Array.isArray(vData) ? vData[0] : null)
        setTrips(Array.isArray(tData) ? tData : [])
        setMaintenance(Array.isArray(mData) ? mData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-16 text-zinc-600">Loading...</div>
  if (!vehicle) return <div className="text-center py-16 text-zinc-600">Vehicle not found.</div>

  const today = new Date().toISOString().split('T')[0]
  const activeTrip = trips.find(t => t.start_date <= today && t.end_date >= today)
  const totalEarned = trips.reduce((sum, t) => sum + Number(t.earnings), 0)
  const totalTrips = trips.length
  const lastService = maintenance[0]

  const typeIcons: Record<string, string> = {
    'Oil Change': '🛢️', 'Tire Change': '🔄', 'Brake Pads': '🔧',
    'Inspection': '🔍', 'Battery': '🔋', 'Other': '⚙️',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/vehicles" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </h1>
          {vehicle.nickname && (
            <p className="text-sm text-zinc-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          )}
        </div>
      </div>

      {/* Status badge */}
      {activeTrip ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-xs text-green-400 uppercase tracking-widest font-semibold mb-1">Currently Rented</p>
          <p className="text-white font-semibold">{activeTrip.customer_name}</p>
          <p className="text-sm text-zinc-400 mt-0.5">Returns {activeTrip.end_date}</p>
        </div>
      ) : (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Status</p>
          <p className="text-white font-semibold">Available</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Earned</p>
          <p className="text-base font-bold text-green-400">${totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Trips</p>
          <p className="text-base font-bold text-white">{totalTrips}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Plate</p>
          <p className="text-base font-bold text-white">{vehicle.license_plate}</p>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Details</p>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Color</span>
          <span className="text-white capitalize">{vehicle.color}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Year</span>
          <span className="text-white">{vehicle.year}</span>
        </div>
        {lastService && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Last Service</span>
            <span className="text-white">{lastService.type} · {lastService.date}</span>
          </div>
        )}
      </div>

      {/* Recent trips */}
      {trips.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Recent Trips</p>
          {trips.slice(0, 5).map(trip => (
            <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{trip.start_date} → {trip.end_date}</p>
              </div>
              <p className="text-green-400 font-semibold">${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance */}
      {maintenance.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Maintenance</p>
          {maintenance.slice(0, 3).map(m => (
            <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{typeIcons[m.type] ?? '⚙️'}</span>
                <div>
                  <p className="font-semibold text-white">{m.type}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{m.date} · {m.mileage_km} km</p>
                </div>
              </div>
              <p className="text-white font-semibold">${m.cost}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
