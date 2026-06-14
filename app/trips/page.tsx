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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Trips</h1>
          <p className="text-zinc-500 mt-1">{trips?.length ?? 0} bookings</p>
        </div>
        <Link
          href="/trips/new"
          className="rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2.5 hover:opacity-80 transition-opacity"
        >
          + Add Trip
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {trips?.map((trip) => (
          <div
            key={trip.id}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-black dark:text-white">
                Trip #{trip.id}
              </p>
              <p className="text-zinc-500 text-sm">
                {trip.customer_name} · {trip.start_date} → {trip.end_date}
              </p>
            </div>
            <p className="text-lg font-semibold text-black dark:text-white">
              ${trip.earnings}
            </p>
          </div>
        ))}

        {trips?.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            No trips yet. Add your first one!
          </div>
        )}
      </div>
    </div>
  )
}
