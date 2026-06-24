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
      <body className={`${geist.className} h-full`} style={{ background: '#000000', color: '#fff' }}>
        <div className="flex flex-col min-h-screen max-w-lg mx-auto relative">
          {/* Header */}
          <header className="flex items-center justify-between px-4 pt-5 pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>NorthFleet</p>
              <p className="text-[17px] font-semibold text-white leading-tight mt-0.5">Taro's Fleet</p>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 pb-32 overflow-y-auto">
            {children}
          </main>

          <FloatingActions />
        </div>
      </body>
    </html>
  );
}
