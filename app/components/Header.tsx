'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      {/* ── HEADER BAR ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E0001A 0%, #FF2200 100%)', boxShadow: '0 0 18px rgba(255,34,0,0.55)' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
            </svg>
          </div>
          <span className="text-[14px] font-bold tracking-tight text-white">NorthFleet</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide"
            style={{ background: 'rgba(255,34,0,0.14)', color: 'rgba(255,60,0,0.85)', border: '1px solid rgba(255,34,0,0.25)' }}>
            PRO
          </span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="pressable w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: open ? 'rgba(255,34,0,0.12)' : 'rgba(255,255,255,0.05)',
            border: open ? '1px solid rgba(255,34,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
            stroke={open ? 'rgba(255,60,0,0.9)' : 'rgba(255,255,255,0.5)'} strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </header>

      {/* ── SETTINGS DROPDOWN (top) ── */}
      {open && (
        <div className="absolute top-full right-4 z-[80] w-72 animate-scale-in"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            transformOrigin: 'top right',
          }}>

          {/* Profile card */}
          <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #E0001A, #FF2200)', boxShadow: '0 0 18px rgba(255,34,0,0.45)' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-white">Taro</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Fleet Owner · PRO</p>
            </div>
          </div>

          {/* Fleet links */}
          <div className="px-2 pt-2">
            <p className="section-label px-2 mb-1">Fleet</p>
            {[
              { label: 'My Vehicles',    icon: '🚗', href: '/vehicles' },
              { label: 'Active Trips',   icon: '📍', href: '/trips' },
              { label: 'Service History',icon: '🔧', href: '/maintenance' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="pressable flex items-center gap-3 px-3 py-2.5 rounded-[14px]"
                style={{ color: 'white' }}>
                <span className="text-sm">{item.icon}</span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* App links */}
          <div className="px-2 pt-1 pb-3">
            <p className="section-label px-2 mb-1 mt-1">App</p>
            {[
              { label: 'Reminders',   icon: '🔔', href: '/reminders' },
              { label: 'Finance',     icon: '💰', href: '/finance' },
              { label: 'AI Assistant',icon: '⚡', href: '/assistant' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="pressable flex items-center gap-3 px-3 py-2.5 rounded-[14px]"
                style={{ color: 'white' }}>
                <span className="text-sm">{item.icon}</span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Version */}
          <div className="border-t px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>NorthFleet v1.0 · PRO</p>
          </div>
        </div>
      )}
    </div>
  )
}
