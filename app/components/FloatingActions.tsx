'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Overlay = { userText?: string; aiText?: string; loading?: boolean; copyText?: string }

const NAV = [
  { href: '/', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/vehicles', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/></svg> },
  { href: '/trips', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
  { href: '/reminders', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { href: '/maintenance', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { href: '/finance', icon: (a: boolean) => <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={a?'#3b82f6':'#71717a'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
]

const QUICK = [
  { label: 'Add Vehicle', href: '/vehicles/new', icon: '🚗' },
  { label: 'Log Trip', href: '/trips/new', icon: '📍' },
  { label: 'Log Service', href: '/maintenance/new', icon: '🔧' },
  { label: 'Add Expense', href: '/finance/expenses/new', icon: '💸' },
]

export default function FloatingActions() {
  const pathname = usePathname()
  const router = useRouter()
  const [listening, setListening] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const recognitionRef = useRef<any>(null)

  function handleMic() {
    if (listening) { recognitionRef.current?.stop(); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setOverlay({ aiText: 'Voice not supported. Try Chrome.' }); return }
    const r = new SR()
    recognitionRef.current = r
    r.continuous = false; r.interimResults = false; r.lang = 'uk-UA'
    r.onstart = () => { setListening(true); setOverlay(null) }
    r.onend = () => setListening(false)
    r.onerror = () => { setListening(false) }
    r.onresult = async (e: any) => {
      const text = e.results[0][0].transcript
      setOverlay({ userText: text, loading: true })
      try {
        const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
        const data = await res.json()
        if (data.actions?.length) {
          for (const a of data.actions) {
            if (a.type === 'navigate') setTimeout(() => router.push(a.path), 900)
            if (a.type === 'create_reminder') {
              try { const ex = JSON.parse(localStorage.getItem('nf_reminders') || '[]'); localStorage.setItem('nf_reminders', JSON.stringify([...ex, a.reminder])) } catch {}
            }
          }
          const cp = data.actions.find((a: any) => a.type === 'copy_message')
          setOverlay({ userText: text, aiText: data.reply || 'Done.', copyText: cp?.text })
        } else {
          setOverlay({ userText: text, aiText: data.reply || '...' })
        }
      } catch { setOverlay({ userText: text, aiText: 'Connection error.' }) }
    }
    r.start(); setPlusOpen(false)
  }

  useEffect(() => {
    if (!plusOpen) return
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('[data-plus]')) setPlusOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [plusOpen])

  // NAV BAR HEIGHT: 56px. Buttons are 56px tall, centered so they sit 28px above the bar top → bottom = 56 - 28/2...
  // Simpler: nav bar is 56px. Buttons sit at bottom: 56 + 4 = 60px from screen bottom, so they overlap the bar.
  const NAV_H = 60 // px, includes safe area
  const BTN_B = NAV_H + 4 // buttons bottom edge sits just above bar

  return (
    <>
      {/* AI overlay */}
      {overlay && (
        <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 pointer-events-none"
          style={{ bottom: NAV_H + 80 }}>
          <div className="pointer-events-auto rounded-[20px] p-4" style={{ background: 'rgba(22,22,22,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
            {overlay.userText && <p className="text-zinc-500 text-xs mb-2">"{overlay.userText}"</p>}
            {overlay.loading ? <p className="text-zinc-400 text-sm">Thinking...</p> : <p className="text-white text-sm leading-relaxed">{overlay.aiText}</p>}
            {!overlay.loading && (
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => setOverlay(null)} className="text-[11px] text-zinc-500 underline">Dismiss</button>
                {overlay.copyText && <button onClick={() => navigator.clipboard.writeText(overlay.copyText!)} className="text-[11px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">Copy message</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plus menu */}
      {plusOpen && (
        <div data-plus className="fixed z-50 flex flex-col gap-1.5 px-4 animate-fade-up"
          style={{ bottom: BTN_B + 64, left: 0 }}>
          {QUICK.map(a => (
            <Link key={a.href} href={a.href} onClick={() => setPlusOpen(false)}
              className="pressable flex items-center gap-3 rounded-[16px] px-4 py-3"
              style={{ background: 'rgba(28,28,30,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              <span className="text-lg">{a.icon}</span>
              <span className="text-sm font-medium text-white">{a.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* PLUS BUTTON — fixed, independent */}
      <button data-plus
        onClick={() => { setPlusOpen(p => !p); setOverlay(null) }}
        style={{ position: 'fixed', bottom: BTN_B, left: 20, zIndex: 50, background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {/* MIC BUTTON — fixed, independent */}
      <button
        onClick={handleMic}
        style={{ position: 'fixed', bottom: BTN_B, right: 20, zIndex: 50, boxShadow: listening ? '0 0 24px rgba(255,69,58,0.5), 0 8px 24px rgba(0,0,0,0.5)' : '0 0 20px rgba(10,132,255,0.4), 0 8px 24px rgba(0,0,0,0.5)', background: listening ? '#FF453A' : '#0A84FF' }}
        className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all"
      >
        {listening
          ? <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><rect x="6" y="6" width="12" height="12" rx="2" fill="white"/></svg>
          : <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
        }
      </button>

      {/* NAV BAR — fixed at very bottom */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 flex items-center justify-around"
        style={{ height: NAV_H, paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 72, paddingRight: 72, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center justify-center w-9 h-9 rounded-xl ${active ? 'bg-blue-500/10' : ''}`}>
              {item.icon(active)}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
