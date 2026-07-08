import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

async function dbFetch(table: string, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${query}`, { headers })
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

async function dbInsert(table: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

const tools: Anthropic.Tool[] = [
  {
    name: 'navigate',
    description: 'Navigate the user to a page in the app. Use when user wants to open a section.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', enum: ['/', '/vehicles', '/trips', '/maintenance', '/finance'], description: 'The page path to navigate to' },
        label: { type: 'string', description: 'Human-readable name of the destination' }
      },
      required: ['path', 'label']
    }
  },
  {
    name: 'add_vehicle',
    description: 'Add a new vehicle to the fleet. Ask for missing required fields if not provided.',
    input_schema: {
      type: 'object' as const,
      properties: {
        make: { type: 'string', description: 'Car brand, e.g. Toyota' },
        model: { type: 'string', description: 'Car model, e.g. Camry' },
        year: { type: 'number', description: 'Year of the car' },
        color: { type: 'string', description: 'Color of the car' },
        license_plate: { type: 'string', description: 'License plate number' },
        nickname: { type: 'string', description: 'Optional nickname for the car' },
      },
      required: ['make', 'model', 'year', 'color', 'license_plate']
    }
  },
  {
    name: 'add_trip',
    description: 'Log a new trip/rental. vehicle_id must match an existing vehicle.',
    input_schema: {
      type: 'object' as const,
      properties: {
        vehicle_id: { type: 'number', description: 'ID of the vehicle being rented' },
        customer_name: { type: 'string', description: 'Name of the customer/renter' },
        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        end_date: { type: 'string', description: 'End date in YYYY-MM-DD format' },
        earnings: { type: 'number', description: 'Earnings in CAD' },
      },
      required: ['vehicle_id', 'customer_name', 'start_date', 'end_date', 'earnings']
    }
  },
  {
    name: 'add_maintenance',
    description: 'Log a maintenance record for a vehicle.',
    input_schema: {
      type: 'object' as const,
      properties: {
        vehicle_id: { type: 'number', description: 'ID of the vehicle' },
        type: { type: 'string', enum: ['Oil Change', 'Tire Change', 'Brake Pads', 'Inspection', 'Battery', 'Other'] },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format, default today' },
        mileage_km: { type: 'number', description: 'Current odometer reading in km' },
        cost: { type: 'number', description: 'Cost in CAD' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['vehicle_id', 'type', 'date', 'mileage_km', 'cost']
    }
  },
  {
    name: 'add_expense',
    description: 'Log an expense for the fleet.',
    input_schema: {
      type: 'object' as const,
      properties: {
        amount: { type: 'number', description: 'Amount in CAD' },
        category: { type: 'string', enum: ['Fuel', 'Insurance', 'Repairs', 'Cleaning', 'Parking', 'Registration', 'Other'] },
        date: { type: 'string', description: 'Date in YYYY-MM-DD, default today' },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['amount', 'category', 'date']
    }
  },
  {
    name: 'get_fleet_status',
    description: 'Get current status of the fleet — vehicles, active trips, recent maintenance.',
    input_schema: { type: 'object' as const, properties: {}, required: [] }
  },
  {
    name: 'create_reminder',
    description: 'Create a reminder for the fleet owner. Use when user says "remind me", "нагадай", "rappelle-moi" etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'What to remind about' },
        due_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        vehicle: { type: 'string', description: 'Optional vehicle name this reminder is about' },
      },
      required: ['title', 'due_date']
    }
  },
  {
    name: 'write_customer_message',
    description: 'Write a professional English message to a Turo customer based on the user\'s rough instruction.',
    input_schema: {
      type: 'object' as const,
      properties: {
        instruction: { type: 'string', description: 'What the user wants to tell the customer' },
        message: { type: 'string', description: 'The polished English message to send to the customer' },
      },
      required: ['instruction', 'message']
    }
  },
]

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ reply: '❌ ANTHROPIC_API_KEY not set in Vercel env vars', debug: ['ANTHROPIC_API_KEY missing'] }, { status: 500 })
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ reply: '❌ NEXT_PUBLIC_SUPABASE_URL not set', debug: ['SUPABASE_URL missing'] }, { status: 500 })
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ reply: '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set', debug: ['SUPABASE_ANON_KEY missing'] }, { status: 500 })

    const { message } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    const vehicles = await dbFetch('vehicles')
    const vehicleList = vehicles.map((v: any) => `ID ${v.id}: ${v.year} ${v.make} ${v.model}${v.nickname ? ` (${v.nickname})` : ''}`).join(', ')

    const system = `You are NorthFleet AI — a smart voice assistant for a Turo fleet manager in Canada.
Today is ${today}.
Fleet vehicles: ${vehicleList || 'none yet'}

You can take real actions using your tools. When user asks you to add something or navigate somewhere — use the appropriate tool immediately.
Reply in the same language as the user (Ukrainian, French, English, etc.).
Be brief and conversational. No markdown, no asterisks, no bullet points.
After using a tool, confirm what you did in 1-2 sentences.`

    // First call — let Claude decide if it needs tools
    const firstResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      tools,
      messages: [{ role: 'user', content: message }],
    })

    // If no tool use — return text directly
    if (firstResponse.stop_reason !== 'tool_use') {
      const text = (firstResponse.content.find((b: any) => b.type === 'text') as any)?.text ?? ''
      return NextResponse.json({ reply: text, debug: [`No tools called. stop_reason=${firstResponse.stop_reason}. Reply: ${text}`] })
    }

    // Process tool calls
    const toolUseBlocks = firstResponse.content.filter((b: any) => b.type === 'tool_use') as any[]
    const toolResults: any[] = []
    const clientActions: any[] = []

    for (const toolUse of toolUseBlocks) {
      const input = toolUse.input as any
      let result = ''

      if (toolUse.name === 'navigate') {
        clientActions.push({ type: 'navigate', path: input.path })
        result = `Navigating to ${input.label}`
      }

      else if (toolUse.name === 'get_fleet_status') {
        const trips = await dbFetch('Trips')
        const maintenance = await dbFetch('Maintenance', '&order=date.desc')
        const activeTrips = trips.filter((t: any) => t.start_date <= today && t.end_date >= today)
        result = JSON.stringify({ vehicles, activeTrips: activeTrips.length, lastMaintenance: maintenance[0] ?? null })
      }

      else if (toolUse.name === 'add_vehicle') {
        const inserted = await dbInsert('vehicles', input)
        if (inserted?.id) {
          clientActions.push({ type: 'navigate', path: '/vehicles' })
          result = `Vehicle added with ID ${inserted.id}`
        } else {
          result = `Error adding vehicle: ${JSON.stringify(inserted)}`
        }
      }

      else if (toolUse.name === 'add_trip') {
        const inserted = await dbInsert('Trips', input)
        if (inserted?.id) {
          clientActions.push({ type: 'navigate', path: '/trips' })
          result = `Trip added with ID ${inserted.id}`
        } else {
          result = `Error: ${JSON.stringify(inserted)}`
        }
      }

      else if (toolUse.name === 'add_maintenance') {
        const inserted = await dbInsert('Maintenance', input)
        if (inserted?.id) {
          clientActions.push({ type: 'navigate', path: '/maintenance' })
          result = `Maintenance record added with ID ${inserted.id}`
        } else {
          result = `Error: ${JSON.stringify(inserted)}`
        }
      }

      else if (toolUse.name === 'add_expense') {
        const inserted = await dbInsert('Expenses', input)
        if (inserted?.id) {
          clientActions.push({ type: 'navigate', path: '/finance' })
          result = `Expense added with ID ${inserted.id}`
        } else {
          result = `Error: ${JSON.stringify(inserted)}`
        }
      }

      else if (toolUse.name === 'create_reminder') {
        clientActions.push({ type: 'create_reminder', reminder: { id: Date.now().toString(), title: input.title, due_date: input.due_date, vehicle: input.vehicle || '', done: false } })
        clientActions.push({ type: 'navigate', path: '/reminders' })
        result = `Reminder created: "${input.title}" for ${input.due_date}`
      }

      else if (toolUse.name === 'write_customer_message') {
        clientActions.push({ type: 'copy_message', text: input.message })
        result = `Message ready: "${input.message}"`
      }

      toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result })
    }

    // Second call — Claude sees tool results and gives final reply
    const finalResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system,
      tools,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: firstResponse.content },
        { role: 'user', content: toolResults },
      ],
    })

    const reply = (finalResponse.content.find((b: any) => b.type === 'text') as any)?.text ?? 'Done.'
    return NextResponse.json({ reply, actions: clientActions, debug: toolResults.map(r => r.content) })
  } catch (err: any) {
    console.error('Assistant error:', err)
    const msg = err?.message || String(err)
    return NextResponse.json({ reply: `Error: ${msg}`, debug: [msg] }, { status: 500 })
  }
}
