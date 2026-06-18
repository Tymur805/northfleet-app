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
  utilization30: number // % of last 30 days rented
  activeNow: boolean
}

export default function VehicleSearch({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase()
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.license_plate.toLowerCase().includes(q) ||
      (v.nickname?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicles..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-zinc-500 placeholder:text-zinc-500"
        />
      </div>

      {filtered.map((vehicle) => (
        <Link
          key={vehicle.id}
          href={`/vehicles/${vehicle.id}`}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:opacity-70 transition-opacity"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl relative">
                🚗
                {vehicle.activeNow && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {vehicle.nickname && `${vehicle.year} ${vehicle.make} ${vehicle.model} · `}{vehicle.license_plate}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-400">${vehicle.totalEarned.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-600">earned</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${vehicle.utilization30 >= 70 ? 'bg-green-500' : vehicle.utilization30 >= 40 ? 'bg-blue-500' : 'bg-zinc-600'}`}
                style={{ width: `${vehicle.utilization30}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 w-12 text-right">{vehicle.utilization30}% / 30d</span>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-600">No vehicles found.</div>
      )}
    </div>
  )
}
