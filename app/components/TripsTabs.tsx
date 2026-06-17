'use client'

import { useState } from 'react'

type Trip = {
  id: number
  customer_name: string
  start_date: string
  end_date: string
  earnings: number
}

export default function TripsTabs({ trips }: { trips: Trip[] }) {
  const [tab, setTab] = useState<'booked' | 'history'>('booked')

  const today = new Date().toISOString().split('T')[0]

  const booked = trips.filter((t) => t.end_date >= today)
  const history = trips.filter((t) => t.end_date < today)

  const displayed = tab === 'booked' ? booked : history

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {(['booked', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'booked' ? `Booked (${booked.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="flex flex-col gap-3">
        {displayed.map((trip) => {
          const active = trip.start_date <= today && trip.end_date >= today
          const start = new Date(trip.start_date)
          const end = new Date(trip.end_date)
          const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

          return (
            <div
              key={trip.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {trip.start_date} → {trip.end_date} · {days} days
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="font-semibold text-white">${Number(trip.earnings).toLocaleString()}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  active
                    ? 'bg-green-500/10 text-green-400'
                    : tab === 'booked'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {active ? 'Active' : tab === 'booked' ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          )
        })}

        {displayed.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            No {tab === 'booked' ? 'upcoming' : 'past'} trips.
          </div>
        )}
      </div>
    </div>
  )
}
