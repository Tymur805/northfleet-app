import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: vehicles } = await supabase.from('vehicles').select('*')
  const { data: trips } = await supabase.from('Trips').select('*')

  const today = new Date().toISOString().split('T')[0]
  const activeTrips = trips?.filter((t) => t.start_date <= today && t.end_date >= today) ?? []
  const totalEarnings = trips?.reduce((sum, t) => sum + Number(t.earnings), 0) ?? 0

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/vehicles" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicles?.length ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Vehicles</p>
          </div>
        </Link>

        <Link href="/trips" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{activeTrips.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Active Trips</p>
          </div>
        </Link>
      </div>

      {/* Total earnings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Earnings</p>
        <p className="text-3xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
        <p className="text-xs text-zinc-600 mt-1">All time · CAD</p>
      </div>

      {/* Active trips */}
      {activeTrips.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Active Now</p>
          {activeTrips.map((trip) => (
            <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{trip.customer_name}</p>
                <p className="text-sm text-zinc-500">Returns {trip.end_date}</p>
              </div>
              <p className="text-green-400 font-semibold">${Number(trip.earnings).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
