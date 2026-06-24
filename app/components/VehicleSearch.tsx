'use client'

import { useState } from 'react'
import Link from 'next/link'

type Vehicle = {
  id: number; make: string; model: string; year: number; color: string
  license_plate: string; nickname?: string; totalEarned: number
  utilization30: number; activeNow: boolean
}

export default function VehicleSearch({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase()
    return v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) ||
      v.license_plate.toLowerCase().includes(q) || (v.nickname?.toLowerCase().includes(q) ?? false)
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Search */}
      <div className="relative mb-1">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fleet..."
          className="w-full rounded-[12px] pl-8 pr-3 py-2 text-sm text-white outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', fontSize: 13 }}
        />
      </div>

      {filtered.map(v => (
        <Link key={v.id} href={`/vehicles/${v.id}`} className="pressable block rounded-[24px] px-3 py-2.5"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-lg"
                style={{ background: '#1C1C1E' }}>
                🚗
                {v.activeNow && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse-dot" style={{ background: '#34C759', border: '1.5px solid #000' }} />}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">{v.nickname || `${v.year} ${v.make} ${v.model}`}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {v.nickname ? `${v.year} ${v.make} ${v.model} · ` : ''}{v.license_plate}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-semibold" style={{ color: '#34C759' }}>${v.totalEarned.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>earned</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{
                width: `${v.utilization30}%`,
                background: v.utilization30 >= 70 ? '#34C759' : v.utilization30 >= 40 ? '#0A84FF' : 'rgba(255,255,255,0.15)'
              }} />
            </div>
            <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{v.utilization30}%</span>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No vehicles found.</p>}
    </div>
  )
}

