import Link from 'next/link'
import TripsTabs from '../components/TripsTabs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

export const dynamic = 'force-dynamic'

export default async function TripsPage() {
  let trips: any[] = []

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/Trips?select=*&order=start_date.desc`,
      { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }
    )
    const data = await res.json()
    trips = Array.isArray(data) ? data : []
  } catch {
    // show empty state
  }

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

      <TripsTabs trips={trips} />
    </div>
  )
}
