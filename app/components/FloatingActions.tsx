'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Overlay = { userText?: string; aiText?: string; loading?: boolean; copyText?: string }

const NAV = [
  { href: '/',            label: 'Home',    icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/vehicles',   label: 'Fleet',   icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/></svg> },
  { href: '/trips',      label: 'Trips',   icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
  { href: '/reminders',  label: 'Alerts',  icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { href: '/maintenance',label: 'Service', icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { href: '/finance',    label: 'Finance', icon: (a:boolean) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={a?'#E10600':'rgba(255,255,255,0.3)'} strokeWidth={a?2:1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
]

const QUICK = [
  { label: 'Add Vehicle', href: '/vehicles/new',        icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/></svg>
  )},
  { label: 'Log Trip',    href: '/trips/new',            icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  )},
  { label: 'Log Service', href: '/maintenance/new',      icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  )},
  { label: 'Add Expense', href: '/finance/expenses/new', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
]

const NAV_H = 64

export default function FloatingActions() {
  const pathname = usePathname()
  const router = useRouter()
  const [listening, setListening] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const recognitionRef = useRef<any>(null)

  const [micPos, setMicPos] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; dragging: boolean }>({ startX:0, startY:0, origX:0, origY:0, dragging:false })

  const defaultMicRight = 20
  const defaultMicBottom = NAV_H + 8

  function onMicPointerDown(e: React.PointerEvent) {
    const btn = e.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX: micPos?.x ?? (window.innerWidth - rect.width - defaultMicRight),
      origY: micPos?.y ?? (window.innerHeight - rect.height - defaultMicBottom),
      dragging: false,
    }
    btn.setPointerCapture(e.pointerId)

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      if (!dragRef.current.dragging && Math.abs(dx) + Math.abs(dy) > 6) dragRef.current.dragging = true
      if (dragRef.current.dragging) {
        const newX = Math.max(8, Math.min(window.innerWidth - 64, dragRef.current.origX + dx))
        const newY = Math.max(8, Math.min(window.innerHeight - 64, dragRef.current.origY + dy))
        setMicPos({ x: newX, y: newY })
      }
    }
    function onUp() {
      btn.removeEventListener('pointermove', onMove)
      btn.removeEventListener('pointerup', onUp)
      if (!dragRef.current.dragging) handleMic()
    }
    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerup', onUp)
  }

  function handleMic() {
    if (listening) { recognitionRef.current?.stop(); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setOverlay({ aiText: 'Voice not supported. Try Chrome.' }); return }
    const r = new SR()
    recognitionRef.current = r
    r.continuous = false; r.interimResults = false; r.lang = 'uk-UA'
    r.onstart = () => { setListening(true); setOverlay(null) }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
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

  const micStyle: React.CSSProperties = micPos
    ? { position: 'fixed', left: micPos.x, top: micPos.y, zIndex: 60 }
    : { position: 'fixed', bottom: defaultMicBottom, right: defaultMicRight, zIndex: 60 }

  return (
    <>
      {/* ── AI OVERLAY ── */}
      {overlay && (
        <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50 animate-slide-up"
          style={{ bottom: NAV_H + 80, pointerEvents: 'none' }}>
          <div className="glass-overlay rounded-[20px] p-4" style={{ pointerEvents: 'auto', border: '1px solid rgba(193,18,31,0.2)' }}>
            {overlay.userText && (
              <p className="text-[11px] mb-2 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>"{overlay.userText}"</p>
            )}
            {overlay.loading
              ? <div className="flex items-center gap-2">
                  <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C1121F' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Thinking…</p>
                </div>
              : <p className="text-[13px] text-white leading-relaxed">{overlay.aiText}</p>
            }
            {!overlay.loading && (
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => setOverlay(null)} className="text-[11px] underline" style={{ color: 'rgba(255,255,255,0.3)' }}>Dismiss</button>
                {overlay.copyText && (
                  <button onClick={() => navigator.clipboard.writeText(overlay.copyText!)}
                    className="spring text-[11px] px-3 py-1 rounded-full"
                    style={{ background: 'rgba(193,18,31,0.15)', color: '#E10600', border: '1px solid rgba(193,18,31,0.3)' }}>
                    Copy message
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PLUS MENU ── */}
      {plusOpen && (
        <div data-plus className="fixed z-50 flex flex-col gap-1.5 px-4 animate-slide-up" style={{ bottom: NAV_H + 72, left: 0 }}>
          {QUICK.map((a, i) => (
            <Link key={a.href} href={a.href} onClick={() => setPlusOpen(false)}
              className={`pressable flex items-center gap-3 px-4 py-3 rounded-[20px] delay-${i*50}`}
              style={{ background: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{a.icon}</span>
              <span className="text-[13px] font-semibold text-white">{a.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── PLUS BUTTON ── */}
      <button data-plus
        onClick={() => { setPlusOpen(p => !p); setOverlay(null) }}
        className="spring"
        style={{
          position: 'fixed', bottom: NAV_H + 8, left: 20, zIndex: 55,
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: plusOpen
            ? 'linear-gradient(135deg, #C1121F, #E10600)'
            : 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${plusOpen ? 'rgba(193,18,31,0.5)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: plusOpen
            ? '0 0 28px rgba(193,18,31,0.5), 0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(0,0,0,0.5)',
        }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
          stroke={plusOpen ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth={2.2}
          style={{ transform: plusOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {/* ── MIC BUTTON ── */}
      <button
        onPointerDown={onMicPointerDown}
        className="spring animate-float"
        style={{
          ...micStyle,
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: listening
            ? 'rgba(255,43,43,0.9)'
            : 'linear-gradient(135deg, #C1121F, #E10600)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${listening ? 'rgba(255,43,43,0.5)' : 'rgba(193,18,31,0.4)'}`,
          boxShadow: listening
            ? '0 0 0 6px rgba(255,43,43,0.18), 0 8px 24px rgba(255,43,43,0.4)'
            : '0 0 20px rgba(193,18,31,0.45), 0 8px 24px rgba(0,0,0,0.4)',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}>
        {listening
          ? <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
        }
      </button>

      {/* ── NAV BAR ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '36rem',
        height: NAV_H, zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 64, paddingRight: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(6,6,6,0.94)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className="pressable flex flex-col items-center justify-center gap-0.5 w-10 h-10 rounded-[18px]"
              style={{ background: active ? 'rgba(193,18,31,0.1)' : 'transparent' }}>
              {item.icon(active)}
              {active && <span className="w-1 h-1 rounded-full animate-pulse-red" style={{ background: '#E10600' }} />}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
