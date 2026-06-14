import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: vehicles } = await supabase.from('vehicles').select('*')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold text-black dark:text-white">
          NorthFleet
        </h1>
        <p className="text-xl text-zinc-500">
          Fleet management for Turo hosts
        </p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            My Vehicles
          </h2>
          {vehicles?.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="font-semibold text-black dark:text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-zinc-500">{vehicle.color} · {vehicle.license_plate}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
