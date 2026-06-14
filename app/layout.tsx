import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NorthFleet",
  description: "Fleet management for Turo hosts",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/vehicles", label: "My Fleet", icon: "🚗" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geist.className} bg-zinc-50 dark:bg-black h-full`}>
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-1 p-4">
            <p className="text-lg font-bold text-black dark:text-white px-3 py-2 mb-2">
              NorthFleet
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors text-sm font-medium"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </aside>
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
