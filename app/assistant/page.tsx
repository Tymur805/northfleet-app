'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm your NorthFleet AI. Ask me anything about your fleet — vehicles, trips, earnings, anything." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice recognition not supported. Try Chrome.'); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = ''
    recognition.onstart = () => setListening(true)
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setListening(false) }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false) }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function handleReply(msg: Message) { setReplyTo(msg); inputRef.current?.focus() }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = replyTo
      ? `Replying to: "${replyTo.text.slice(0, 80)}${replyTo.text.length > 80 ? '...' : ''}"\n\n${input.trim()}`
      : input.trim()
    setInput(''); setReplyTo(null)
    setMessages(prev => [...prev, { role: 'user', text: input.trim() }])
    setLoading(true)
    const res = await fetch('/api/assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
    const text = await res.text()
    if (!text) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: empty response from server.' }])
      setLoading(false); return
    }
    const { reply, error } = JSON.parse(text)
    setMessages(prev => [...prev, { role: 'assistant', text: reply ?? `Error: ${error}` }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col pt-1" style={{ height: 'calc(100vh - 10rem)' }}>
      <h1 className="text-[17px] font-bold text-white mb-4">AI Assistant</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-end gap-2 group max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                  style={{ background: 'linear-gradient(135deg, #C1121F, #E10600)', boxShadow: '0 0 12px rgba(193,18,31,0.4)' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              )}
              <div>
                <div className={`rounded-[18px] px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`} style={
                  msg.role === 'user'
                    ? { background: 'white', color: '#000' }
                    : { background: '#181818', color: '#fff', border: '1px solid rgba(255,255,255,0.07)' }
                }>
                  {msg.text}
                </div>
                <button
                  onClick={() => handleReply(msg)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] mt-1 px-1"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-3 rounded-[18px] rounded-bl-sm"
              style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#C1121F' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot delay-100" style={{ background: '#C1121F' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot delay-200" style={{ background: '#C1121F' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between rounded-[12px] px-3 py-2 mb-2"
          style={{ background: '#181818', borderLeft: '2px solid #C1121F' }}>
          <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Replying to: {replyTo.text.slice(0, 60)}{replyTo.text.length > 60 ? '...' : ''}
          </p>
          <button onClick={() => setReplyTo(null)} className="ml-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={listening ? stopListening : startListening}
          className="w-11 h-11 rounded-full flex items-center justify-center spring shrink-0"
          style={{
            background: listening
              ? 'linear-gradient(135deg, #C1121F, #E10600)'
              : 'rgba(255,255,255,0.07)',
            border: `1px solid ${listening ? 'rgba(193,18,31,0.4)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: listening ? '0 0 16px rgba(193,18,31,0.4)' : 'none',
          }}>
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening…' : 'Ask about your fleet…'}
          className="flex-1 text-[14px] text-white outline-none"
          style={{
            background: '#161616',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 999,
            padding: '0 18px',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-full flex items-center justify-center spring shrink-0"
          style={{
            background: 'linear-gradient(135deg, #C1121F, #E10600)',
            boxShadow: '0 0 16px rgba(193,18,31,0.4)',
            opacity: loading || !input.trim() ? 0.4 : 1,
          }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
