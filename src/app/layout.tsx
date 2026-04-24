import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study with HYOB",
  description: "Daily English articles picked for learners",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
          <nav className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              📰 Study with HYOB
            </Link>
            <div className="flex items-center gap-5 text-sm text-neutral-700">
              <Link href="/" className="hover:text-neutral-950">홈</Link>
              <Link href="/my" className="hover:text-neutral-950">마이</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6">{children}</main>
        <footer className="py-8 text-center text-xs text-neutral-400">
          매주 월요일 오전, 새로운 아티클이 추천돼요.
        </footer>
      </body>
    </html>
  );
}
