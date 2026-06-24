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
    <div className="flex flex-col gap-3 animate-fade-up">
      <div className="mb-1">
        <h1 className="text-[17px] font-semibold text-white">Reminders</h1>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Say "Remind me to check tires on BMW tomorrow"</p>
      </div>

      {/* Auto-reminders from trips */}
      {!loading && (upcomingReturns.length > 0 || upcomingPickups.length > 0) && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>From Your Schedule</p>
          {upcomingReturns.map(t => {
            const v = vehicleMap[t.vehicle_id]
            const vLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${t.vehicle_id}`
            return (
              <div key={`return-${t.id}`} className="pressable rounded-[20px] p-3.5 flex items-center justify-between"
                style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.18)' }}>
                <div>
                  <p className="font-semibold text-sm text-white">Return: {vLabel}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>From {t.customer_name}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ml-2"
                  style={{ background: 'rgba(255,159,10,0.12)', color: '#FF9F0A' }}>{daysLabel(t.end_date)}</span>
              </div>
            )
          })}
          {upcomingPickups.map(t => {
            const v = vehicleMap[t.vehicle_id]
            const vLabel = v ? (v.nickname || `${v.year} ${v.make} ${v.model}`) : `Vehicle #${t.vehicle_id}`
            return (
              <div key={`pickup-${t.id}`} className="pressable rounded-[20px] p-3.5 flex items-center justify-between"
                style={{ background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.18)' }}>
                <div>
                  <p className="font-semibold text-sm text-white">Pickup: {vLabel}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>For {t.customer_name}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ml-2"
                  style={{ background: 'rgba(10,132,255,0.12)', color: '#0A84FF' }}>{daysLabel(t.start_date)}</span>
              </div>
            )
          })}
        </div>
      )}

      {activeReminders.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Your Reminders</p>
          {activeReminders.sort((a, b) => a.due_date.localeCompare(b.due_date)).map(r => (
            <div key={r.id} className="rounded-[20px] p-3.5 flex items-center gap-3"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => toggle(r.id)} className="w-5 h-5 rounded-full shrink-0"
                style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{r.title}</p>
                {r.vehicle && <p className="text-[11px] mt-0.5" style={{ color: '#0A84FF' }}>{r.vehicle}</p>}
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{daysLabel(r.due_date)} · {r.due_date}</p>
              </div>
              <button onClick={() => remove(r.id)} className="pressable shrink-0">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {doneReminders.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.15)' }}>Done</p>
          {doneReminders.map(r => (
            <div key={r.id} className="flex items-center gap-3 px-1">
              <button onClick={() => toggle(r.id)} className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(52,199,89,0.15)' }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#34C759" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <p className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.2)' }}>{r.title}</p>
              <button onClick={() => remove(r.id)} className="ml-auto pressable">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.15)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && activeReminders.length === 0 && upcomingReturns.length === 0 && upcomingPickups.length === 0 && (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm">No reminders yet. Use the mic!</p>
        </div>
      )}
    </div>
  )
}
