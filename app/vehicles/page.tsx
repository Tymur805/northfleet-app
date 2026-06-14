import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase.from('vehicles').select('*').order('year', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">My Fleet</h1>
            <p className="text-zinc-500 mt-1">{vehicles?.length ?? 0} vehicles</p>
          </div>
          <Link
            href="/vehicles/new"
            className="rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2.5 hover:opacity-80 transition-opacity"
          >
            + Add Vehicle
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {vehicles?.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold text-black dark:text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-zinc-500 text-sm">
                  {vehicle.color} · {vehicle.license_plate}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                🚗
              </div>
            </div>
          ))}

          {vehicles?.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              No vehicles yet. Add your first one!
            </div>
          )}
        </div>

        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors text-center">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
