import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import FloatingActions from "./components/FloatingActions";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NorthFleet",
  description: "Fleet management for Turo hosts",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} h-full`} style={{ background: '#090909', color: '#fff' }}>
        <div className="flex flex-col min-h-screen max-w-xl mx-auto relative">

          {/* Header */}
          <header className="flex items-center justify-between px-4 pt-5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C1121F 0%, #E10600 100%)', boxShadow: '0 0 14px rgba(193,18,31,0.45)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
                </svg>
              </div>
              <span className="text-[14px] font-bold tracking-tight text-white">NorthFleet</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide"
                style={{ background: 'rgba(193,18,31,0.12)', color: 'rgba(193,18,31,0.7)', border: '1px solid rgba(193,18,31,0.2)' }}>
                PRO
              </span>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.45)" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 pb-28 overflow-y-auto">
            {children}
          </main>

          <FloatingActions />
        </div>
      </body>
    </html>
  );
}
