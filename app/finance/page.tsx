import Link from 'next/link'
import FinanceTabs from '../components/FinanceTabs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  let trips: any[] = []
  let expenses: any[] = []
  let vehicles: any[] = []

  try {
    const [tripsRes, expensesRes, vehiclesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/Trips?select=*&order=start_date.desc`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
      fetch(`${SUPABASE_URL}/rest/v1/Expenses?select=*&order=date.desc`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
      fetch(`${SUPABASE_URL}/rest/v1/vehicles?select=*`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
    ])

    const [tripsData, expensesData, vehiclesData] = await Promise.all([
      tripsRes.json(),
      expensesRes.json(),
      vehiclesRes.json(),
    ])

    trips = Array.isArray(tripsData) ? tripsData : []
    expenses = Array.isArray(expensesData) ? expensesData : []
    vehicles = Array.isArray(vehiclesData) ? vehiclesData : []
  } catch {
    // show empty state instead of crashing
  }

  const totalIncome = trips.reduce((sum, t) => sum + Number(t.earnings), 0)
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
  const cashFlow = totalIncome - totalExpenses

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-white">Finance</h1>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Income</p>
          <p className="text-lg font-bold text-green-400">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Expenses</p>
          <p className="text-lg font-bold text-red-400">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Profit</p>
          <p className={`text-lg font-bold ${cashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
            ${cashFlow.toLocaleString()}
          </p>
        </div>
      </div>

      <FinanceTabs trips={trips} expenses={expenses} vehicles={vehicles} />
    </div>
  )
}
