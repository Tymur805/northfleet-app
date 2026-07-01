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
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay())
  const weekStr = startOfWeek.toISOString().split('T')[0]

  const activeTrips = trips.filter(t => t.start_date <= today && t.end_date >= today)
  const returningTrips = trips.filter(t => t.end_date >= today && t.end_date <= dayAfter && t.start_date <= today)
  const monthEarnings = trips.filter(t => t.start_date?.startsWith(thisMonth)).reduce((s, t) => s + Number(t.earnings), 0)
  const weekEarnings = trips.filter(t => t.start_date >= weekStr).reduce((s, t) => s + Number(t.earnings), 0)
  const todayEarnings = trips.filter(t => t.start_date === today).reduce((s, t) => s + Number(t.earnings), 0)
  const totalEarnings = trips.reduce((s, t) => s + Number(t.earnings), 0)

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))

  const lastOilByVehicle = maintenance
    .filter(m => m.type === 'Oil Change')
    .reduce((acc: any[], m) => {
      if (!acc.find((x: any) => x.vehicle_id === m.vehicle_id)) acc.push(m)
      return acc
    }, [])

  if (loading) return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map(i => <div key={i} className="skeleton h-20 rounded-[20px]" />)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-[20px]" />)}
      </div>
      <div className="skeleton h-14 rounded-[20px]" />
      <div className="skeleton h-14 rounded-[20px]" />
    </div>
  )

  return (
    <div className="flex flex-col gap-3 pt-1 animate-fade-up">

      {/* EARNINGS GRID — Today / Week / Month */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Today',      value: todayEarnings,  count: trips.filter(t=>t.start_date===today).length },
          { label: 'This Week',  value: weekEarnings,   count: trips.filter(t=>t.start_date>=weekStr).length },
          { label: 'This Month', value: monthEarnings,  count: trips.filter(t=>t.start_date?.startsWith(thisMonth)).length },
        ].map(w => (
          <Link key={w.label} href="/finance"
            className="pressable rounded-[20px] p-3.5 flex flex-col gap-1.5"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label" style={{ marginTop: 0 }}>{w.label}</p>
            <p className="text-[17px] font-bold tabular-nums" style={{ color: '#34C759' }}>${w.value.toLocaleString()}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{w.count} trip{w.count !== 1 ? 's' : ''}</p>
          </Link>
        ))}
      </div>

      {/* FLEET STATUS ROW */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/vehicles" className="pressable rounded-[20px] p-3 flex items-center gap-2.5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(193,18,31,0.12)' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#C1121F" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
            </svg>
          </div>
          <div>
            <p className="text-[18px] font-bold text-white leading-none">{vehicles.length}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Vehicles</p>
          </div>
        </Link>

        <Link href="/trips" className="pressable rounded-[20px] p-3 flex items-center gap-2.5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(52,199,89,0.12)' }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse-dot" style={{ background: '#34C759' }} />
          </div>
          <div>
            <p className="text-[18px] font-bold leading-none" style={{ color: '#34C759' }}>{activeTrips.length}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Active</p>
          </div>
        </Link>

        <Link href="/finance" className="pressable rounded-[20px] p-3 flex items-center gap-2.5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white leading-none">${totalEarnings.toLocaleString()}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>All time</p>
          </div>
        </Link>
      </div>

      {/* RETURNING SOON */}
      {returningTrips.length > 0 && (
        <>
          <p className="section-label">Returning Soon</p>
          {returningTrips.map(trip => {
            const v = vehicleMap[trip.vehicle_id]
            const label = v ? (v.nickname || `${v.make} ${v.model}`) : `#${trip.vehicle_id}`
            const when = trip.end_date === today ? 'Today' : trip.end_date === tomorrow ? 'Tomorrow' : 'In 2 days'
            return (
              <div key={trip.id} className="pressable rounded-[20px] px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.18)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,159,10,0.12)' }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#FF9F0A" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white leading-none">{trip.customer_name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#FF9F0A' }}>{label}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,159,10,0.12)', color: '#FF9F0A' }}>{when}</span>
              </div>
            )
          })}
        </>
      )}

      {/* ACTIVE NOW */}
      {activeTrips.length > 0 && (
        <>
          <p className="section-label">Active Now</p>
          {activeTrips.map(trip => {
            const v = vehicleMap[trip.vehicle_id]
            const label = v ? (v.nickname || `${v.make} ${v.model}`) : `#${trip.vehicle_id}`
            return (
              <div key={trip.id} className="pressable rounded-[20px] px-4 py-3 flex items-center justify-between"
                style={{ background: '#111111', border: '1px solid rgba(52,199,89,0.15)' }}>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full animate-pulse-dot shrink-0" style={{ background: '#34C759' }} />
                  <div>
                    <p className="text-[13px] font-semibold text-white leading-none">{trip.customer_name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label} · returns {trip.end_date}</p>
                  </div>
                </div>
                <p className="text-[13px] font-bold shrink-0" style={{ color: '#34C759' }}>+${Number(trip.earnings).toLocaleString()}</p>
              </div>
            )
          })}
        </>
      )}

      {/* LAST OIL CHANGES */}
      {lastOilByVehicle.length > 0 && (
        <>
          <p className="section-label">Last Oil Change</p>
          {lastOilByVehicle.slice(0, 3).map((m: any) => {
            const v = vehicleMap[m.vehicle_id]
            const label = v ? (v.nickname || `${v.make} ${v.model}`) : `#${m.vehicle_id}`
            return (
              <Link key={m.id} href="/maintenance"
                className="pressable rounded-[20px] px-4 py-3 flex items-center justify-between"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,159,10,0.1)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FF9F0A' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white leading-none">{label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.date}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                  {m.mileage_km?.toLocaleString()} km
                </span>
              </Link>
            )
          })}
        </>
      )}

      {vehicles.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center"
            style={{ background: 'rgba(193,18,31,0.08)', border: '1px solid rgba(193,18,31,0.15)' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(193,18,31,0.5)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">No vehicles yet</p>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Add your first vehicle to get started</p>
          </div>
          <Link href="/vehicles/new" className="btn-primary px-5 py-2.5 text-[13px] mt-1">
            Add Vehicle
          </Link>
        </div>
      )}
    </div>
  )
}
