import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import TripsTabs from '../components/TripsTabs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function TripsPage() {
  const { data: trips } = await supabase
    .from('Trips')
    .select('*')
    .order('start_date', { ascending: false })

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

      <TripsTabs trips={trips ?? []} />
    </div>
  )
}
