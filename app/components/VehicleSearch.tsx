'use client'

import { useState } from 'react'
import Link from 'next/link'

type Vehicle = {
  id: number
  make: string
  model: string
  year: number
  color: string
  license_plate: string
  nickname?: string
  totalEarned: number
  utilization30: number
  activeNow: boolean
}

export default function VehicleSearch({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase()
    return v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) ||
      v.license_plate.toLowerCase().includes(q) || (v.nickname?.toLowerCase().includes(q) ?? false)
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.28)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vehicles..."
          className="w-full rounded-[14px] pl-9 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}
        />
      </div>

      {/* Vehicle cards */}
      {filtered.map(v => (
        <Link key={v.id} href={`/vehicles/${v.id}`} className="pressable block rounded-[20px] p-4"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Vehicle icon */}
              <div className="relative w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl"
                style={{ background: '#1C1C1E' }}>
                🚗
                {v.activeNow && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse-dot"
                    style={{ background: '#34C759', border: '2px solid #000' }} />
                )}
              </div>
              <div>
                <p className="font-semibold text-[15px] text-white leading-tight">
                  {v.nickname || `${v.year} ${v.make} ${v.model}`}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {v.nickname ? `${v.year} ${v.make} ${v.model} · ` : ''}{v.license_plate}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: '#34C759' }}>${v.totalEarned.toLocaleString()}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>earned</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${v.utilization30}%`,
                  background: v.utilization30 >= 70 ? '#34C759' : v.utilization30 >= 40 ? '#0A84FF' : 'rgba(255,255,255,0.2)'
                }} />
            </div>
            <span className="text-[10px] w-14 text-right shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {v.utilization30}% / 30d
            </span>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>No vehicles found.</div>
      )}
    </div>
  )
}
