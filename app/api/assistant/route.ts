import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const { message } = await request.json()

  // Fetch all data from the database
  const { data: vehicles } = await supabase.from('vehicles').select('*')
  const { data: trips } = await supabase.from('Trips').select('*')
  const maintenanceRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Maintenance?select=*&order=date.desc`,
    { headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` } }
  )
  const maintenance = await maintenanceRes.json()

  const context = `
You are NorthFleet AI, a helpful assistant for a Turo fleet manager in Canada.
You have access to the following real data from the fleet management system:

VEHICLES:
${JSON.stringify(vehicles, null, 2)}

TRIPS:
${JSON.stringify(trips, null, 2)}

MAINTENANCE RECORDS:
${JSON.stringify(maintenance, null, 2)}

Today's date is ${new Date().toISOString().split('T')[0]}.

Rules:
- Answer in the same language the user writes in (Ukrainian, French, English, etc.)
- Do not use markdown formatting — no asterisks, no bullet points with *, no headers with #. Just plain conversational text.
- If the user asks you to write a message to a customer, always write it in perfect professional English regardless of what language the user speaks. Label it clearly as "Message to customer:" followed by the message.
- If you don't have enough data to answer, say so honestly.
- Distance is in kilometers, currency is CAD.
`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: message }
      ],
      system: context,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply: text })
  } catch (err: any) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
