'use client'

import { useEffect, useState } from 'react'

type Reminder = {
  id: string
  title: string
  due_date: string
  vehicle?: string
  done: boolean
}

function getReminders(): Reminder[] {
  try { return JSON.parse(localStorage.getItem('nf_reminders') || '[]') } catch { return [] }
}
function saveReminders(r: Reminder[]) {
  localStorage.setItem('nf_reminders', JSON.stringify(r))
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setReminders(getReminders())
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h = { 'apikey': key, 'Authorization': `Bearer ${key}` }
    Promise.all([
      fetch(`${url}/rest/v1/Trips?select=*&order=start_date.asc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/vehicles?select=*`, { headers: h }).then(r => r.json()),
    ]).then(([t, v]) => {
      setTrips(Array.isArray(t) ? t : [])
      setVehicles(Array.isArray(v) ? v : [])
    }).finally(() => setLoading(false))
  }, [])

  function toggle(id: string) {
    const updated = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r)
    setReminders(updated)
    saveReminders(updated)
  }

  function remove(id: string) {
    const updated = reminders.filter(r => r.id !== id)
    setReminders(updated)
    saveReminders(updated)
  }

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))
  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  // Auto-reminders from trips
  const upcomingReturns = trips.filter(t => t.end_date >= today && t.end_date <= in7days && t.start_date <= today)
  const upcomingPickups = trips.filter(t => t.start_date >= today && t.start_date <= in7days)

  function daysLabel(date: string) {
    const diff = Math.round((new Date(date).getTime() - new Date(today).getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return `In ${diff} days`
  }

  const activeReminders = reminders.filter(r => !r.done)
  const doneReminders = reminders.filter(r => r.done)

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-white">Reminders</h1>

      <p className="text-xs text-zinc-500">Use the mic button and say "Remind me to check tires on BMW tomorrow" to add reminders.</p>

      {/* Auto-reminders from trips */}
      {!loading && (upcomingReturns.length > 0 || upcomingPickups.length > 0) && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">From Your Schedule</p>

          {upcomingReturns.map(t => {
            const v = vehicleMap[t.vehicle_id]
            const vLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${t.vehicle_id}`
            return (
              <div key={`return-${t.id}`} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Return: {vLabel}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">From {t.customer_name}</p>
                </div>
                <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full shrink-0 ml-2">
                  {daysLabel(t.end_date)}
                </span>
              </div>
            )
          })}

          {upcomingPickups.map(t => {
            const v = vehicleMap[t.vehicle_id]
            const vLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${t.vehicle_id}`
            return (
              <div key={`pickup-${t.id}`} className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Pickup: {vLabel}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">For {t.customer_name}</p>
                </div>
                <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full shrink-0 ml-2">
                  {daysLabel(t.start_date)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Manual reminders */}
      {activeReminders.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Your Reminders</p>
          {activeReminders
            .sort((a, b) => a.due_date.localeCompare(b.due_date))
            .map(r => (
              <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
                <button
                  onClick={() => toggle(r.id)}
                  className="w-5 h-5 rounded-full border-2 border-zinc-600 flex items-center justify-center shrink-0"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">{r.title}</p>
                  {r.vehicle && <p className="text-xs text-blue-400 mt-0.5">{r.vehicle}</p>}
                  <p className="text-xs text-zinc-500 mt-0.5">{daysLabel(r.due_date)} · {r.due_date}</p>
                </div>
                <button onClick={() => remove(r.id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      )}

      {doneReminders.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">Done</p>
          {doneReminders.map(r => (
            <div key={r.id} className="flex items-center gap-3 px-1">
              <button onClick={() => toggle(r.id)} className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <p className="text-sm text-zinc-600 line-through">{r.title}</p>
              <button onClick={() => remove(r.id)} className="ml-auto text-zinc-700">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && activeReminders.length === 0 && upcomingReturns.length === 0 && upcomingPickups.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          No reminders yet. Say something to the mic!
        </div>
      )}
    </div>
  )
}
