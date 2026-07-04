import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SCHEMAS: Record<string, string> = {
  vehicle: `Extract vehicle info. Return JSON:
{ "make": string, "model": string, "year": string, "color": string, "license_plate": string, "nickname": string }
All strings. Year as "2022". license_plate uppercase. nickname optional (empty string if not mentioned).`,

  trip: `Extract trip/rental info. Return JSON:
{ "customer_name": string, "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "earnings": string, "vehicle_hint": string }
vehicle_hint is any vehicle name/plate mentioned. earnings as number string e.g. "320". Dates relative to today: {{TODAY}}.`,

  maintenance: `Extract service/maintenance info. Return JSON:
{ "type": string, "date": "YYYY-MM-DD", "mileage_km": string, "cost": string, "notes": string, "vehicle_hint": string }
type must be one of: Oil Change, Tire Change, Brake Pads, Inspection, Battery, Other.
date default today: {{TODAY}}. mileage_km and cost as number strings. notes optional.`,

  expense: `Extract expense info. Return JSON:
{ "category": string, "description": string, "amount": string, "date": "YYYY-MM-DD", "vendor": string, "vehicle_hint": string }
category must be one of: Fuel, Insurance, Maintenance, Repairs, Car Wash, Parking, Registration, Other.
date default today: {{TODAY}}. amount as number string.`,
}

export async function POST(request: Request) {
  try {
    const { text, formType, vehicles = [] } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    const schema = SCHEMAS[formType]?.replace(/\{\{TODAY\}\}/g, today)
    if (!schema) return NextResponse.json({ error: 'Unknown form type' }, { status: 400 })

    const vehicleList = vehicles.length
      ? `\nAvailable vehicles: ${vehicles.map((v: any) => `${v.id}: ${v.year} ${v.make} ${v.model}${v.nickname ? ` (${v.nickname})` : ''} plate ${v.license_plate}`).join(', ')}`
      : ''

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `${schema}${vehicleList}\n\nUser said: "${text}"\n\nReturn ONLY valid JSON, no explanation.`,
      }],
    })

    const raw = (response.content[0] as any)?.text ?? '{}'
    const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
    const parsed = JSON.parse(json)

    // Resolve vehicle_hint to vehicle_id
    if (parsed.vehicle_hint && vehicles.length) {
      const hint = parsed.vehicle_hint.toLowerCase()
      const match = vehicles.find((v: any) =>
        `${v.make} ${v.model} ${v.nickname ?? ''} ${v.license_plate}`.toLowerCase().includes(hint) ||
        hint.includes(v.make.toLowerCase()) ||
        hint.includes(v.model.toLowerCase())
      )
      if (match) parsed.vehicle_id = String(match.id)
    }

    return NextResponse.json({ fields: parsed })
  } catch (err) {
    console.error('parse-form error:', err)
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 })
  }
}
