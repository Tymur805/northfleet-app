'use client'

import { useState } from 'react'

type Vehicle = {
  id: number
  make: string
  model: string
  year: number
  color: string
  license_plate: string
  nickname?: string
  totalEarned: number
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
        <div
          key={vehicle.id}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-3xl">
              🚗
            </div>
            <div>
              <p className="font-semibold text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-zinc-500 mt-0.5">
                {vehicle.nickname && <span className="text-zinc-400 font-medium">{vehicle.nickname} · </span>}
                {vehicle.color} · {vehicle.license_plate}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-400">${vehicle.totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Total earned</p>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          No vehicles match your search.
        </div>
      )}
    </div>
  )
}
