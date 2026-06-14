import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Welcome to NorthFleet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/vehicles"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-5 flex items-center gap-4 hover:border-zinc-400 transition-colors"
        >
          <span className="text-3xl">🚗</span>
          <div>
            <p className="font-semibold text-black dark:text-white">My Fleet</p>
            <p className="text-zinc-500 text-sm">{count ?? 0} vehicles</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
