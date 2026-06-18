import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import FinanceTabs from '../components/FinanceTabs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const { data: trips } = await supabase.from('Trips').select('*').order('start_date', { ascending: false })
  const { data: vehicles } = await supabase.from('vehicles').select('*')

  const expensesRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Expenses?select=*&order=date.desc`,
    {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: 'no-store',
    }
  )
  const expensesData = await expensesRes.json()
  const expenses = Array.isArray(expensesData) ? expensesData : []

  const totalIncome = trips?.reduce((sum, t) => sum + Number(t.earnings), 0) ?? 0
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
  const cashFlow = totalIncome - totalExpenses

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-white">Finance</h1>

      {/* Summary cards */}
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

      <FinanceTabs trips={trips ?? []} expenses={expenses} vehicles={vehicles ?? []} />
    </div>
  )
}
