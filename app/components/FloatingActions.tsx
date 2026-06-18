'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Message = { role: 'user' | 'ai'; text: string }

const navItems = [
  { href: '/', label: 'Home', icon: (active: boolean) => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active ? '#3b82f6' : '#71717a'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { href: '/vehicles', label: 'Fleet', icon: (active: boolean) => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active ? '#3b82f6' : '#71717a'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4" />
    </svg>
  )},
  { href: '/trips', label: 'Trips', icon: (active: boolean) => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active ? '#3b82f6' : '#71717a'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )},
  { href: '/maintenance', label: 'Service', icon: (active: boolean) => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active ? '#3b82f6' : '#71717a'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  )},
  { href: '/finance', label: 'Finance', icon: (active: boolean) => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active ? '#3b82f6' : '#71717a'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
]

const quickActions = [
  { label: 'Add Vehicle', href: '/vehicles/new', icon: '🚗' },
  { label: 'Log Trip', href: '/trips/new', icon: '📍' },
  { label: 'Log Service', href: '/maintenance/new', icon: '🔧' },
  { label: 'Add Expense', href: '/finance/expenses/new', icon: '💸' },
]

export default function FloatingActions() {
  const pathname = usePathname()
  const [listening, setListening] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [overlay, setOverlay] = useState<{ userText?: string; aiText?: string; loading?: boolean } | null>(null)
  const recognitionRef = useRef<any>(null)

  function handleMic() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setOverlay({ aiText: 'Voice not supported. Try Chrome.' })
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'uk-UA'

    recognition.onstart = () => { setListening(true); setOverlay(null) }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); setOverlay(null) }

    recognition.onresult = async (e: any) => {
      const text = e.results[0][0].transcript
      setOverlay({ userText: text, loading: true })
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
        const data = await res.json()
        setOverlay({ userText: text, aiText: data.reply || '...' })
      } catch {
        setOverlay({ userText: text, aiText: 'Connection error.' })
      }
    }

    recognition.start()
    setPlusOpen(false)
  }

  useEffect(() => {
    if (!plusOpen) return
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-plus]')) setPlusOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [plusOpen])

  return (
    <>
      {/* AI overlay */}
      {overlay && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-5 pointer-events-none" style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))' }}>
          <div className="w-full max-w-lg pointer-events-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl">
            {overlay.userText && (
              <p className="text-zinc-500 text-xs mb-2">"{overlay.userText}"</p>
            )}
            {overlay.loading ? (
              <p className="text-zinc-400 text-sm">Thinking...</p>
            ) : (
              <p className="text-white text-sm leading-relaxed">{overlay.aiText}</p>
            )}
            {!overlay.loading && (
              <button onClick={() => setOverlay(null)} className="mt-3 text-[11px] text-zinc-500 underline">Dismiss</button>
            )}
          </div>
        </div>
      )}

      {/* Plus menu */}
      {plusOpen && (
        <div data-plus className="fixed z-50 flex flex-col gap-2 px-5" style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))', left: 0 }}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setPlusOpen(false)}
              className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 shadow-xl active:opacity-70"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom bar: [+] [nav tabs] [🎤] */}
      <div className="flex items-end justify-between px-5 pb-3">
        {/* Plus button — pops above the bar */}
        <button
          data-plus
          onClick={() => { setPlusOpen(p => !p); setOverlay(null) }}
          className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform -translate-y-4"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Nav icons centered */}
        <div className="flex items-center gap-0 pb-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center px-3 py-1">
                {item.icon(active)}
                <span className={`text-[9px] mt-0.5 font-medium ${active ? 'text-blue-500' : 'text-zinc-500'}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Mic button — pops above the bar */}
        <button
          onClick={handleMic}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all -translate-y-4 ${
            listening ? 'bg-red-500 shadow-red-500/40' : 'bg-blue-500 shadow-blue-500/40'
          }`}
        >
          {listening ? (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
            </svg>
          ) : (
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
