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
    ]).then(([v, t, m]) => {
      setVehicles(Array.isArray(v) ? v : [])
      setTrips(Array.isArray(t) ? t : [])
      setMaintenance(Array.isArray(m) ? m : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

  const activeTrips = trips.filter(t => t.start_date <= today && t.end_date >= today)
  const returningTrips = trips.filter(t => t.end_date >= today && t.end_date <= dayAfter && t.start_date <= today)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthEarnings = trips.filter(t => t.start_date?.startsWith(thisMonth)).reduce((s, t) => s + Number(t.earnings), 0)
  const totalEarnings = trips.reduce((s, t) => s + Number(t.earnings), 0)

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))

  const lastOilByVehicle = maintenance
    .filter(m => m.type === 'Oil Change')
    .reduce((acc: any[], m) => {
      if (!acc.find((x: any) => x.vehicle_id === m.vehicle_id)) acc.push(m)
      return acc
    }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="skeleton h-28 w-full rounded-[20px]" />
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton h-20 rounded-[20px]" />
          <div className="skeleton h-20 rounded-[20px]" />
        </div>
        <div className="skeleton h-16 rounded-[20px]" />
        <div className="skeleton h-16 rounded-[20px]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-up">
      {/* Hero earnings card */}
      <div className="rounded-[20px] p-4 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0A84FF 0%, #0059CC 100%)',
        boxShadow: '0 8px 32px rgba(10,132,255,0.3)'
      }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(20%, -20%)' }} />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-100/70">This Month</p>
        <p className="text-[34px] font-bold text-white leading-tight mt-1">${monthEarnings.toLocaleString()}<span className="text-lg font-normal text-blue-100/60"> CAD</span></p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-[11px] text-blue-100/60">All time: <span className="text-white font-semibold">${totalEarnings.toLocaleString()}</span></p>
          <span className="w-px h-3 bg-blue-100/20" />
          <p className="text-[11px] text-blue-100/60">{trips.length} trips total</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/vehicles" className="pressable rounded-[20px] p-3 flex flex-col gap-2" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0A84FF" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{vehicles.length}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Vehicles</p>
          </div>
        </Link>

        <Link href="/trips" className="pressable rounded-[20px] p-3 flex flex-col gap-2" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,199,89,0.15)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#34C759" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: '#34C759' }}>{activeTrips.length}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Active</p>
          </div>
        </Link>

        <Link href="/maintenance" className="pressable rounded-[20px] p-3 flex flex-col gap-2" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.15)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#FF9F0A" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{maintenance.length}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Services</p>
          </div>
        </Link>
      </div>

      {/* Returning soon */}
      {returningTrips.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Returning Soon</p>
          {returningTrips.map(trip => {
            const v = vehicleMap[trip.vehicle_id]
            const label = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${trip.vehicle_id}`
            const when = trip.end_date === today ? 'Today' : trip.end_date === tomorrow ? 'Tomorrow' : 'In 2 days'
            return (
              <div key={trip.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between"
                style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.18)' }}>
                <div>
                  <p className="font-semibold text-sm text-white">{trip.customer_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#FF9F0A' }}>{label}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,159,10,0.12)', color: '#FF9F0A' }}>
                  {when}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Active trips */}
      {activeTrips.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Active Now</p>
          {activeTrips.map(trip => {
            const v = vehicleMap[trip.vehicle_id]
            const label = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${trip.vehicle_id}`
            return (
              <div key={trip.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,199,89,0.12)' }}>
                      <span className="animate-pulse-dot w-2 h-2 rounded-full" style={{ background: '#34C759', display: 'block' }} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{trip.customer_name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#0A84FF' }}>{label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Returns {trip.end_date}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#34C759' }}>+${Number(trip.earnings).toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Last service alerts */}
      {lastOilByVehicle.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Last Oil Change</p>
          {lastOilByVehicle.slice(0, 3).map((m: any) => {
            const v = vehicleMap[m.vehicle_id]
            const label = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${m.vehicle_id}`
            return (
              <Link key={m.id} href="/maintenance" className="pressable rounded-[20px] p-3.5 flex items-center justify-between"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="font-semibold text-sm text-white">{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.date}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  {m.mileage_km?.toLocaleString()} km
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {!loading && vehicles.length === 0 && (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <p className="text-4xl mb-3">🚗</p>
          <p className="text-sm">Add your first vehicle to get started</p>
        </div>
      )}
    </div>
  )
}
