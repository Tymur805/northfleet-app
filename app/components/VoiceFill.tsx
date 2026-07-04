'use client'

import { useState, useRef } from 'react'

type Props = {
  formType: 'vehicle' | 'trip' | 'maintenance' | 'expense'
  vehicles?: any[]
  onFill: (fields: Record<string, string>) => void
}

const HINTS: Record<string, string> = {
  vehicle:     'e.g. "Toyota Camry 2022, white, plate ABC 123, nickname Milano"',
  trip:        'e.g. "John Smith, BMW X5, July 5 to July 10, 450 dollars"',
  maintenance: 'e.g. "Oil change on BMW X5, 58000 km, cost 89 dollars"',
  expense:     'e.g. "Fuel 60 dollars at Shell for the Camry"',
}

export default function VoiceFill({ formType, vehicles = [], onFill }: Props) {
  const [state, setstate] = useState<'idle' | 'listening' | 'parsing' | 'done' | 'error'>('idle')
  const [transcript, setTranscript] = useState('')
  const recRef = useRef<any>(null)

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setstate('error'); return }
    const r = new SR()
    recRef.current = r
    r.lang = 'uk-UA'
    r.continuous = false
    r.interimResults = false
    r.onstart = () => setstate('listening')
    r.onerror = () => setstate('error')
    r.onresult = async (e: any) => {
      const text = e.results[0][0].transcript
      setTranscript(text)
      setstate('parsing')
      try {
        const res = await fetch('/api/parse-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, formType, vehicles }),
        })
        const { fields } = await res.json()
        if (fields) { onFill(fields); setstate('done') }
        else setstate('error')
      } catch { setstate('error') }
    }
    r.onend = () => { if (state === 'listening') setstate('idle') }
    r.start()
  }

  function stop() { recRef.current?.stop() }
  function reset() { setstate('idle'); setTranscript('') }

  const colors = {
    idle:      { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)',  icon: 'rgba(255,255,255,0.5)', glow: 'none' },
    listening: { bg: 'rgba(255,34,0,0.2)',     border: 'rgba(255,34,0,0.5)',     icon: '#FF2200',               glow: '0 0 20px rgba(255,34,0,0.5)' },
    parsing:   { bg: 'rgba(255,159,10,0.12)',  border: 'rgba(255,159,10,0.3)',   icon: '#FF9F0A',               glow: '0 0 16px rgba(255,159,10,0.3)' },
    done:      { bg: 'rgba(52,199,89,0.12)',   border: 'rgba(52,199,89,0.3)',    icon: '#34C759',               glow: '0 0 16px rgba(52,199,89,0.3)' },
    error:     { bg: 'rgba(255,69,58,0.12)',   border: 'rgba(255,69,58,0.3)',    icon: '#FF453A',               glow: 'none' },
  }
  const c = colors[state]

  return (
    <div className="flex flex-col gap-3 rounded-[20px] p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="flex items-center gap-3">
        {/* Mic button */}
        <button
          onClick={state === 'listening' ? stop : state === 'done' || state === 'error' ? reset : startListening}
          className="spring w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.glow }}>
          {state === 'listening' ? (
            <svg width="20" height="20" fill={c.icon} viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          ) : state === 'parsing' ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={2} className="animate-spin">
              <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          ) : state === 'done' ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          ) : state === 'error' ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          )}
        </button>

        <div className="flex-1">
          {state === 'idle' && (
            <>
              <p className="text-[13px] font-semibold text-white">Fill by voice</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{HINTS[formType]}</p>
            </>
          )}
          {state === 'listening' && (
            <>
              <p className="text-[13px] font-semibold animate-pulse" style={{ color: '#FF2200' }}>Listening…</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Speak clearly, then stop</p>
            </>
          )}
          {state === 'parsing' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#FF9F0A' }}>Filling form…</p>
              <p className="text-[11px] mt-0.5 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>"{transcript}"</p>
            </>
          )}
          {state === 'done' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#34C759' }}>Done! Check and submit</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Tap mic to redo</p>
            </>
          )}
          {state === 'error' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>Try again</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Voice not recognized</p>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>or fill manually</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  )
}
