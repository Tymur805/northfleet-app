import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
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
      <body className={`${geist.className} bg-[#0f1117] text-white h-full`}>
        <div className="flex flex-col min-h-screen max-w-lg mx-auto relative">
          {/* Top header */}
          <header className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">NorthFleet</p>
              <p className="text-lg font-semibold text-white">Taro's Fleet</p>
            </div>
            <button className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 px-5 pb-36 overflow-y-auto">
            {children}
          </main>

          <FloatingActions />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
