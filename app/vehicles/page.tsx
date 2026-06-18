import Link from 'next/link'
import VehicleSearch from '../components/VehicleSearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

export const dynamic = 'force-dynamic'

export default async function VehiclesPage() {
  let vehicles: any[] = []
  let trips: any[] = []

  try {
    const [vehiclesRes, tripsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/vehicles?select=*&order=year.desc`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
      fetch(`${SUPABASE_URL}/rest/v1/Trips?select=vehicle_id,earnings`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
    ])
    const [vehiclesData, tripsData] = await Promise.all([vehiclesRes.json(), tripsRes.json()])
    vehicles = Array.isArray(vehiclesData) ? vehiclesData : []
    trips = Array.isArray(tripsData) ? tripsData : []
  } catch {
    // show empty state
  }

  const earningsByVehicle: Record<number, number> = {}
  trips.forEach((trip) => {
    earningsByVehicle[trip.vehicle_id] = (earningsByVehicle[trip.vehicle_id] ?? 0) + Number(trip.earnings)
  })

  const vehiclesWithEarnings = vehicles.map((v) => ({
    ...v,
    totalEarned: earningsByVehicle[v.id] ?? 0,
  }))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fleet</h1>
        <Link
          href="/vehicles/new"
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg hover:opacity-80 transition-opacity"
        >
          +
        </Link>
      </div>

      <VehicleSearch vehicles={vehiclesWithEarnings} />
    </div>
  )
}
