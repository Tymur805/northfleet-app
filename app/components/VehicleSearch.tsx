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
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fleet..."
          className="input-dark" style={{ paddingLeft: 36 }}
        />
      </div>

      {filtered.map(v => (
        <Link key={v.id} href={`/vehicles/${v.id}`}
          className="pressable block rounded-[20px] px-4 py-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
                </svg>
                {v.activeNow && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse-dot"
                    style={{ background: '#34C759', border: '2px solid #090909' }} />
                )}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">
                  {v.nickname || `${v.year} ${v.make} ${v.model}`}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {v.nickname ? `${v.year} ${v.make} ${v.model} · ` : ''}{v.license_plate}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-bold" style={{ color: '#34C759' }}>${v.totalEarned.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>earned</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="flex items-center gap-2.5 mt-2.5">
            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${v.utilization30}%`,
                background: v.utilization30 >= 70
                  ? '#34C759'
                  : v.utilization30 >= 40
                  ? '#FF2200'
                  : 'rgba(255,255,255,0.15)'
              }} />
            </div>
            <span className="text-[10px] shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>{v.utilization30}%</span>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
          No vehicles found.
        </p>
      )}
    </div>
  )
}
