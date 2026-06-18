import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import VehicleSearch from '../components/VehicleSearch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase.from('vehicles').select('*').order('year', { ascending: false })
  const { data: trips } = await supabase.from('Trips').select('vehicle_id, earnings')

  const earningsByVehicle: Record<number, number> = {}
  trips?.forEach((trip) => {
    earningsByVehicle[trip.vehicle_id] = (earningsByVehicle[trip.vehicle_id] ?? 0) + Number(trip.earnings)
  })

  const vehiclesWithEarnings = vehicles?.map((v) => ({
    ...v,
    totalEarned: earningsByVehicle[v.id] ?? 0,
  })) ?? []

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
