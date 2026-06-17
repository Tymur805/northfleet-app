import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase.from('vehicles').select('*').order('year', { ascending: false })

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

      <div className="flex flex-col gap-3">
        {vehicles?.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
                🚗
              </div>
              <div>
                <p className="font-semibold text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {vehicle.color} · {vehicle.license_plate}
                </p>
              </div>
            </div>
          </div>
        ))}

        {vehicles?.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            No vehicles yet. Tap + to add one.
          </div>
        )}
      </div>
    </div>
  )
}
