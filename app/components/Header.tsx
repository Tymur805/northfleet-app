'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
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
          onClick={() => setOpen(true)}
          className="pressable w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </header>

      {/* ── SETTINGS PANEL ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-xl z-[80] animate-slide-up"
            style={{ bottom: 0, borderRadius: '28px 28px 0 0', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-[17px] font-bold text-white">Settings</p>
              <button onClick={() => setOpen(false)} className="pressable w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Profile card */}
            <div className="mx-4 mb-3 rounded-[20px] p-4 flex items-center gap-3"
              style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #E0001A, #FF2200)', boxShadow: '0 0 22px rgba(255,34,0,0.5)' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-white">Taro</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Fleet Owner · PRO</p>
              </div>
            </div>

            {/* Settings groups */}
            <div className="flex flex-col gap-2 px-4 pb-8">

              {/* Fleet */}
              <p className="section-label px-1">Fleet</p>
              <div className="rounded-[20px] overflow-hidden" style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'My Vehicles', icon: '🚗', href: '/vehicles' },
                  { label: 'Active Trips', icon: '📍', href: '/trips' },
                  { label: 'Service History', icon: '🔧', href: '/maintenance' },
                ].map((item, i, arr) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className="pressable flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[14px] font-medium text-white">{item.label}</span>
                    </div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>

              {/* App */}
              <p className="section-label px-1 mt-1">App</p>
              <div className="rounded-[20px] overflow-hidden" style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Reminders', icon: '🔔', href: '/reminders' },
                  { label: 'Finance',   icon: '💰', href: '/finance' },
                  { label: 'AI Assistant', icon: '⚡', href: '/assistant' },
                ].map((item, i, arr) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className="pressable flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[14px] font-medium text-white">{item.label}</span>
                    </div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Version */}
              <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
                NorthFleet v1.0 · PRO
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
