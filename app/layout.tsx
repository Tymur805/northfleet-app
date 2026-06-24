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
      <body className={`${geist.className} h-full`} style={{ background: '#000', color: '#fff' }}>
        <div className="flex flex-col min-h-screen max-w-xl mx-auto relative">

          {/* Compact header */}
          <header className="flex items-center justify-between px-3 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#0A84FF' }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M4 17l1.5-6h13L20 17M7 11l1-4h8l1 4"/>
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-white">NorthFleet</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>Taro</span>
            </div>
            <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </header>

          {/* Page content — tight padding */}
          <main className="flex-1 px-3 pb-28 overflow-y-auto">
            {children}
          </main>

          <FloatingActions />
        </div>
      </body>
    </html>
  );
}
