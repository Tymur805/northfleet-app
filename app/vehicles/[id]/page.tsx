'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  'Oil Change':  '#FF9F0A',
  'Tire Change': '#C1121F',
  'Brake Pads':  '#FF453A',
  'Inspection':  '#34C759',
  'Battery':     '#BF5AF2',
  'Other':       'rgba(255,255,255,0.4)',
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
    <div className="flex flex-col gap-3 pt-1">
      <div className="skeleton h-8 w-1/2 rounded-lg" />
      <div className="skeleton h-20 rounded-[20px]" />
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
    <div className="flex flex-col gap-3 pt-1 animate-fade-up">
      {/* Back */}
      <div className="flex items-center gap-3 mb-1">
        <Link href="/vehicles" className="pressable w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[17px] font-bold text-white leading-tight">
            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </h1>
          {vehicle.nickname && (
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
          )}
        </div>
      </div>

      {/* Status card */}
      {activeTrip ? (
        <div className="rounded-[20px] p-4 flex items-center justify-between"
          style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.18)' }}>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#34C759' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#34C759' }}>Currently Rented</p>
            </div>
            <p className="font-semibold text-[13px] text-white">{activeTrip.customer_name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Returns {activeTrip.end_date}</p>
          </div>
          <p className="text-[18px] font-bold" style={{ color: '#34C759' }}>+${Number(activeTrip.earnings).toLocaleString()}</p>
        </div>
      ) : (
        <div className="rounded-[20px] p-3.5 flex items-center gap-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Available</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'This Month', value: `$${monthEarned.toLocaleString()}`, color: '#34C759' },
          { label: 'All Time',   value: `$${totalEarned.toLocaleString()}`, color: 'white' },
          { label: 'Plate',      value: vehicle.license_plate,              color: 'white' },
        ].map(stat => (
          <div key={stat.label} className="rounded-[20px] p-3.5" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label" style={{ marginTop: 0 }}>{stat.label}</p>
            <p className="text-[13px] font-bold mt-1 tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="rounded-[20px] p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="section-label" style={{ marginTop: 0, marginBottom: 12 }}>Details</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Year',  value: vehicle.year },
            { label: 'Color', value: vehicle.color },
            { label: 'Plate', value: vehicle.license_plate },
            ...(lastService ? [{ label: 'Last Service', value: `${lastService.type} · ${lastService.date}` }] : []),
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
              <span className="text-[13px] font-semibold text-white capitalize">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trips */}
      {trips.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="section-label">Recent Trips</p>
          {trips.slice(0, 5).map(trip => (
            <div key={trip.id} className="pressable rounded-[20px] p-4 flex items-center justify-between"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="font-semibold text-[13px] text-white">{trip.customer_name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{trip.start_date} → {trip.end_date}</p>
              </div>
              <p className="text-[13px] font-bold" style={{ color: '#34C759' }}>+${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Service history */}
      {maintenance.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="section-label">Service History</p>
          {maintenance.slice(0, 5).map(m => {
            const color = typeColors[m.type] || 'rgba(255,255,255,0.4)'
            return (
              <div key={m.id} className="pressable rounded-[20px] p-4 flex items-center justify-between"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-white">{m.type}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.date} · {m.mileage_km?.toLocaleString()} km</p>
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-white">${m.cost}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
