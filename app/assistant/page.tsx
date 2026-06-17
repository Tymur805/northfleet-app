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
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Try Chrome.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = '' // auto-detect language
    recognition.onstart = () => setListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleReply(msg: Message) {
    setReplyTo(msg)
    inputRef.current?.focus()
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = replyTo
      ? `Replying to: "${replyTo.text.slice(0, 80)}${replyTo.text.length > 80 ? '...' : ''}"\n\n${input.trim()}`
      : input.trim()
    setInput('')
    setReplyTo(null)
    setMessages((prev) => [...prev, { role: 'user', text: input.trim() }])
    setLoading(true)

    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
    const text = await res.text()
    if (!text) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Error: empty response from server.' }])
      setLoading(false)
      return
    }
    const { reply, error } = JSON.parse(text)
    setMessages((prev) => [...prev, { role: 'assistant', text: reply ?? `Error: ${error}` }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <h1 className="text-2xl font-bold text-white mb-4">AI Assistant</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-1.5 group">
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleReply(msg)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white text-black rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <button
                  onClick={() => handleReply(msg)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 text-zinc-400 text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between bg-zinc-800 border-l-2 border-white rounded-lg px-3 py-2 mb-2">
          <p className="text-xs text-zinc-400 truncate">
            Replying to: {replyTo.text.slice(0, 60)}{replyTo.text.length > 60 ? '...' : ''}
          </p>
          <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white ml-2 text-sm">✕</button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={listening ? stopListening : startListening}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            listening ? 'bg-red-500 animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening...' : 'Ask about your fleet...'}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-3 text-white text-sm outline-none focus:border-zinc-500 placeholder:text-zinc-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center disabled:opacity-40 hover:opacity-80 transition-opacity"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
