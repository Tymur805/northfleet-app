'use client'

import { useState } from 'react'

type Trip = { id: number; customer_name: string; vehicle_id: number; start_date: string; end_date: string; earnings: number }
type Vehicle = { id: number; nickname?: string; make: string; model: string; year: number }

export default function TripsTabs({ trips, vehicles = [] }: { trips: Trip[], vehicles?: Vehicle[] }) {
  const [tab, setTab] = useState<'booked' | 'history'>('booked')

  const today = new Date().toISOString().split('T')[0]
  const booked = trips.filter(t => t.end_date >= today)
  const history = trips.filter(t => t.end_date < today)
  const displayed = tab === 'booked' ? booked : history

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['booked', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="pressable flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-all"
            style={tab === t ? { background: '#1C1C1E', color: 'white' } : { color: 'rgba(255,255,255,0.35)' }}>
            {t === 'booked' ? `Booked (${booked.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {/* Trip cards */}
      <div className="flex flex-col gap-2">
        {displayed.map((trip, i) => {
          const active = trip.start_date <= today && trip.end_date >= today
          const days = Math.max(1, Math.round((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000))
          const v = vehicleMap[trip.vehicle_id]
          const vehicleLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${trip.vehicle_id}`

          return (
            <div key={trip.id} className="pressable rounded-[20px] p-3.5 flex items-center justify-between animate-fade-up"
              style={{ background: '#111111', border: `1px solid ${active ? 'rgba(52,199,89,0.18)' : 'rgba(255,255,255,0.07)'}`, animationDelay: `${i * 30}ms` }}>
              <div className="flex items-center gap-3">
                {active && <span className="w-2 h-2 rounded-full animate-pulse-dot shrink-0" style={{ background: '#34C759' }} />}
                <div>
                  <p className="font-semibold text-sm text-white">{trip.customer_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#0A84FF' }}>{vehicleLabel}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {trip.start_date} → {trip.end_date} · {days}d
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <p className="font-semibold text-sm text-white">${Number(trip.earnings).toLocaleString()}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={active
                    ? { background: 'rgba(52,199,89,0.12)', color: '#34C759' }
                    : tab === 'booked'
                    ? { background: 'rgba(10,132,255,0.1)', color: '#0A84FF' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                  {active ? 'Active' : tab === 'booked' ? 'Upcoming' : 'Done'}
                </span>
              </div>
            </div>
          )
        })}

        {displayed.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No {tab === 'booked' ? 'upcoming' : 'past'} trips.
          </div>
        )}
      </div>
    </div>
  )
}
