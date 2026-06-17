import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function TripsPage() {
  const { data: trips, error } = await supabase
    .from('Trips')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) console.error(error)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trips</h1>
        <Link
          href="/trips/new"
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg hover:opacity-80 transition-opacity"
        >
          +
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {trips?.map((trip) => (
          <div
            key={trip.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-white">{trip.customer_name}</p>
              <p className="text-sm text-zinc-500 mt-0.5">
                {trip.start_date} → {trip.end_date}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="font-semibold text-white">${trip.earnings}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 uppercase tracking-wide">
                Active
              </span>
            </div>
          </div>
        ))}

        {trips?.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            No trips yet. Tap + to add one.
          </div>
        )}
      </div>
    </div>
  )
}
