'use client'

import { useState, useRef } from 'react'

type Props = {
  formType: 'vehicle' | 'trip' | 'maintenance' | 'expense'
  vehicles?: any[]
  onFill: (fields: Record<string, string>) => void
}

const HINTS: Record<string, string> = {
  vehicle:     '"Toyota Camry 2022, white, plate ABC 123"',
  trip:        '"John Smith, BMW X5, July 5 to July 10, 450 dollars"',
  maintenance: '"Oil change on BMW, 58000 km, cost 89 dollars"',
  expense:     '"Fuel 60 dollars at Shell for the Camry"',
}

export default function VoiceFill({ formType, vehicles = [], onFill }: Props) {
  const [state, setState] = useState<'idle' | 'listening' | 'parsing' | 'done' | 'error'>('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const recRef = useRef<any>(null)
  const gotResultRef = useRef(false)

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setErrorMsg('Voice not supported. Use Chrome or Safari.')
      setState('error')
      return
    }

    gotResultRef.current = false
    const r = new SR()
    recRef.current = r
    r.lang = ''          // auto-detect language (works better than forcing uk-UA on some devices)
    r.continuous = false
    r.interimResults = false
    r.maxAlternatives = 1

    r.onstart = () => { setState('listening'); setErrorMsg('') }

    r.onerror = (e: any) => {
      gotResultRef.current = true // prevent onend from overwriting
      const messages: Record<string, string> = {
        'no-speech':         'No speech detected. Speak louder or closer to mic.',
        'audio-capture':     'Microphone not found. Check permissions.',
        'not-allowed':       'Microphone blocked. Allow mic access in browser settings.',
        'network':           'Network error during recognition.',
        'aborted':           'Cancelled.',
        'language-not-supported': 'Language not supported on this device.',
      }
      setErrorMsg(messages[e.error] || `Recognition error: ${e.error}`)
      setState('error')
    }

    r.onresult = async (e: any) => {
      gotResultRef.current = true
      const text = e.results[0][0].transcript
      setTranscript(text)
      setState('parsing')
      try {
        const res = await fetch('/api/parse-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, formType, vehicles }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrorMsg(`API error: ${json.error || res.status}`)
          setState('error')
          return
        }
        if (json.fields && Object.keys(json.fields).length > 0) {
          onFill(json.fields)
          setState('done')
        } else {
          setErrorMsg('Could not parse the info. Try again with more detail.')
          setState('error')
        }
      } catch (err: any) {
        setErrorMsg(`Network error: ${err.message}`)
        setState('error')
      }
    }

    r.onend = () => {
      // only reset to idle if we never got a result/error (e.g. user said nothing and stopped)
      if (!gotResultRef.current) {
        setErrorMsg('No speech detected. Tap mic and speak.')
        setState('error')
      }
    }

    r.start()
  }

  function stop() { recRef.current?.stop() }
  function reset() { setState('idle'); setTranscript(''); setErrorMsg(''); gotResultRef.current = false }

  const c = {
    idle:      { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)',  icon: 'rgba(255,255,255,0.5)', glow: 'none' },
    listening: { bg: 'rgba(255,34,0,0.2)',     border: 'rgba(255,34,0,0.5)',     icon: '#FF2200',               glow: '0 0 20px rgba(255,34,0,0.5)' },
    parsing:   { bg: 'rgba(255,159,10,0.12)',  border: 'rgba(255,159,10,0.3)',   icon: '#FF9F0A',               glow: '0 0 16px rgba(255,159,10,0.3)' },
    done:      { bg: 'rgba(52,199,89,0.12)',   border: 'rgba(52,199,89,0.3)',    icon: '#34C759',               glow: '0 0 16px rgba(52,199,89,0.3)' },
    error:     { bg: 'rgba(255,69,58,0.12)',   border: 'rgba(255,69,58,0.35)',   icon: '#FF453A',               glow: 'none' },
  }[state]

  return (
    <div className="flex flex-col gap-3 rounded-[20px] p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="flex items-start gap-3">
        {/* Mic button */}
        <button
          onClick={state === 'listening' ? stop : (state === 'done' || state === 'error') ? reset : startListening}
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
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M4 20L20 4"/>
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c.icon} strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          )}
        </button>

        <div className="flex-1 pt-1">
          {state === 'idle' && (
            <>
              <p className="text-[13px] font-semibold text-white">Fill by voice</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{HINTS[formType]}</p>
            </>
          )}
          {state === 'listening' && (
            <>
              <p className="text-[13px] font-semibold animate-pulse" style={{ color: '#FF2200' }}>Listening…</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Speak, then pause. Tap to stop.</p>
            </>
          )}
          {state === 'parsing' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#FF9F0A' }}>Filling form…</p>
              {transcript && (
                <p className="text-[11px] mt-1 italic" style={{ color: 'rgba(255,255,255,0.4)' }}>"{transcript}"</p>
              )}
            </>
          )}
          {state === 'done' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#34C759' }}>Done — check and submit</p>
              {transcript && (
                <p className="text-[11px] mt-1 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>"{transcript}"</p>
              )}
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Tap × to redo</p>
            </>
          )}
          {state === 'error' && (
            <>
              <p className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>Something went wrong</p>
              {errorMsg && (
                <p className="text-[11px] mt-1 leading-snug" style={{ color: 'rgba(255,100,80,0.8)' }}>{errorMsg}</p>
              )}
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Tap × to try again</p>
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
