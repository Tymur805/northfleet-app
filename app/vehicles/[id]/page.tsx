'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  'Oil Change': '#FF9F0A',
  'Tire Change': '#0A84FF',
  'Brake Pads': '#FF453A',
  'Inspection': '#34C759',
  'Battery': '#BF5AF2',
  'Other': 'rgba(255,255,255,0.4)',
}

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
    ]).then(([vd, td, md]) => {
      setVehicle(Array.isArray(vd) ? vd[0] : null)
      setTrips(Array.isArray(td) ? td : [])
      setMaintenance(Array.isArray(md) ? md : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="skeleton h-6 w-1/2 rounded-lg" />
      <div className="skeleton h-24 rounded-[20px]" />
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-[20px]" />)}
      </div>
    </div>
  )
  if (!vehicle) return <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.25)' }}>Vehicle not found.</div>

  const today = new Date().toISOString().split('T')[0]
  const activeTrip = trips.find(t => t.start_date <= today && t.end_date >= today)
  const totalEarned = trips.reduce((s, t) => s + Number(t.earnings), 0)

  const nowMonth = new Date()
  const thisMonth = `${nowMonth.getFullYear()}-${String(nowMonth.getMonth() + 1).padStart(2, '0')}`
  const monthEarned = trips.filter(t => t.start_date?.startsWith(thisMonth)).reduce((s, t) => s + Number(t.earnings), 0)

  const lastService = maintenance[0]

  return (
    <div className="flex flex-col gap-3 animate-fade-up">
      {/* Back */}
      <div className="flex items-center gap-2 mb-1">
        <Link href="/vehicles" className="pressable w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[17px] font-semibold text-white">
            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </h1>
          {vehicle.nickname && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
          )}
        </div>
      </div>

      {/* Status card */}
      {activeTrip ? (
        <div className="rounded-[20px] p-4 flex items-center justify-between" style={{
          background: 'rgba(52,199,89,0.07)',
          border: '1px solid rgba(52,199,89,0.2)'
        }}>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#34C759' }} />
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#34C759' }}>Currently Rented</p>
            </div>
            <p className="font-semibold text-sm text-white">{activeTrip.customer_name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Returns {activeTrip.end_date}</p>
          </div>
          <p className="text-lg font-bold" style={{ color: '#34C759' }}>+${Number(activeTrip.earnings).toLocaleString()}</p>
        </div>
      ) : (
        <div className="rounded-[20px] p-3.5 flex items-center gap-3" style={{
          background: '#111111', border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Available</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'This Month', value: `$${monthEarned.toLocaleString()}`, color: '#34C759' },
          { label: 'All Time', value: `$${totalEarned.toLocaleString()}`, color: 'white' },
          { label: 'Plate', value: vehicle.license_plate, color: 'white' },
        ].map(stat => (
          <div key={stat.label} className="rounded-[20px] p-3 flex flex-col gap-1" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            <p className="text-[13px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Vehicle details */}
      <div className="rounded-[20px] p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Details</p>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Year', value: vehicle.year },
            { label: 'Color', value: vehicle.color },
            { label: 'Plate', value: vehicle.license_plate },
            ...(lastService ? [{ label: 'Last Service', value: `${lastService.type} · ${lastService.date}` }] : []),
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
              <span className="text-sm font-medium text-white capitalize">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trips */}
      {trips.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Recent Trips</p>
          {trips.slice(0, 5).map(trip => (
            <div key={trip.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="font-semibold text-sm text-white">{trip.customer_name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{trip.start_date} → {trip.end_date}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#34C759' }}>+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance history */}
      {maintenance.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Service History</p>
          {maintenance.slice(0, 5).map(m => (
            <div key={m.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${typeColors[m.type] || 'rgba(255,255,255,0.1)'}18` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: typeColors[m.type] || 'rgba(255,255,255,0.4)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{m.type}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.date} · {m.mileage_km?.toLocaleString()} km</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">${m.cost}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
