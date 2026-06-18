'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = { role: 'user' | 'ai'; text: string }

export default function FloatingActions() {
  const [micActive, setMicActive] = useState(false)
  const [listening, setListening] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const recognitionRef = useRef<any>(null)

  const quickActions = [
    { label: 'Add Vehicle', href: '/vehicles/new', icon: '🚗' },
    { label: 'Log Trip', href: '/trips/new', icon: '📍' },
    { label: 'Log Maintenance', href: '/maintenance/new', icon: '🔧' },
    { label: 'Add Expense', href: '/finance/expenses/new', icon: '💸' },
  ]

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessage({ role: 'ai', text: 'Voice not supported in this browser. Try Chrome.' })
      setMicActive(true)
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'uk-UA'

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); setMicActive(false) }

    recognition.onresult = async (e: any) => {
      const text = e.results[0][0].transcript
      setMessage({ role: 'user', text })
      setLoading(true)
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
        const data = await res.json()
        setMessage({ role: 'ai', text: data.reply || 'No response.' })
      } catch {
        setMessage({ role: 'ai', text: 'Error connecting to AI.' })
      }
      setLoading(false)
    }

    recognition.start()
    setMicActive(true)
    setMessage(null)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function handleMic() {
    if (!micActive) {
      startListening()
    } else if (listening) {
      stopListening()
    } else {
      setMicActive(false)
      setMessage(null)
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!plusOpen) return
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#plus-menu')) setPlusOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [plusOpen])

  return (
    <>
      {/* AI response overlay */}
      {micActive && (
        <div className="fixed inset-0 z-40 flex items-end justify-center pb-36 px-5 pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto">
            {listening && (
              <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-4 mb-3 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: 16 + i * 6, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-blue-400 text-sm">Listening...</p>
              </div>
            )}
            {message && !listening && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-3">
                {message.role === 'user' && (
                  <p className="text-zinc-400 text-xs mb-2">You said: "{message.text}"</p>
                )}
                {loading ? (
                  <p className="text-zinc-400 text-sm">Thinking...</p>
                ) : message.role === 'ai' ? (
                  <p className="text-white text-sm">{message.text}</p>
                ) : null}
                {!loading && (
                  <button
                    onClick={() => { setMicActive(false); setMessage(null) }}
                    className="mt-3 text-xs text-zinc-500 underline"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plus quick-add menu */}
      {plusOpen && (
        <div id="plus-menu" className="fixed z-50 flex flex-col gap-2" style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))', left: 20 }}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setPlusOpen(false)}
              className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 shadow-xl active:opacity-70 transition-opacity"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Floating buttons row — sits above BottomNav */}
      <div
        className="fixed z-50 flex items-center justify-between px-5 w-full max-w-lg"
        style={{ bottom: 'calc(68px + env(safe-area-inset-bottom))' }}
      >
        {/* Plus button */}
        <button
          id="plus-menu"
          onClick={() => { setPlusOpen(p => !p); setMicActive(false) }}
          className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Mic button */}
        <button
          onClick={handleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${
            listening
              ? 'bg-red-500 shadow-red-500/30'
              : micActive
              ? 'bg-zinc-700'
              : 'bg-blue-500 shadow-blue-500/30'
          }`}
        >
          {listening ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
