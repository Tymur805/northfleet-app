import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import FloatingActions from "./components/FloatingActions";
import Header from "./components/Header";

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
          <Header />
          <main className="flex-1 px-4 pb-32 overflow-y-auto">
            {children}
          </main>
          <FloatingActions />
        </div>
      </body>
    </html>
  );
}
