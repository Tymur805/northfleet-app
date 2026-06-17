import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { count: vehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
  const { count: tripCount } = await supabase.from('Trips').select('*', { count: 'exact', head: true })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Link href="/vehicles" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicleCount ?? 0}</p>
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
            <p className="text-2xl font-bold text-white">{tripCount ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Trips</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
