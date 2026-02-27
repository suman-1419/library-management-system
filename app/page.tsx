'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalBooks: number
  totalAuthors: number
  totalReaders: number
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => { })
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-[#C4956A] border-b-2 border-[#C4956A] pb-0.5">Home</Link>
            <Link href="/sign-up" className="text-sm font-medium text-[#666666] hover:text-[#222222]">Browse</Link>
            <Link href="/sign-in" className="text-sm font-medium text-[#666666] hover:text-[#222222]">My Library</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-[#222222] hover:text-[#C4956A] px-4 py-2 transition-colors">
              Log In
            </Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-[#C4956A] hover:bg-[#b5835a] text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h1 className="text-5xl font-extrabold text-[#222222] leading-tight mb-6">
              Let&apos;s take a new<br />journey with a new<br />Book
            </h1>
            <p className="text-[#666666] text-lg leading-relaxed mb-8 max-w-md">
              Access thousands of textbooks, bestsellers, and academic resources instantly. Save up to 80% by renting digital copies.
            </p>
            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/sign-up"
                className="px-6 py-3 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-lg transition-colors shadow-lg shadow-[#C4956A]/20"
              >
                Start Browsing
              </Link>
              <Link href="/sign-up" className="px-6 py-3 font-semibold text-[#222222] hover:text-[#C4956A] transition-colors">
                How it Works
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-10 border-t border-gray-200 pt-8">
              <div>
                <p className="text-2xl font-extrabold text-[#222222]">
                  {stats ? `${stats.totalBooks}+` : '—'}
                </p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mt-0.5">Books Available</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#222222]">
                  {stats ? `${stats.totalAuthors}+` : '—'}
                </p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mt-0.5">Authors</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#222222]">
                  {stats ? `${stats.totalReaders}+` : '—'}
                </p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mt-0.5">Readers</p>
              </div>
            </div>
          </div>

          {/* Right — Decorative image area */}
          <div className="relative">
            <div className="w-full h-[420px] rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center overflow-hidden shadow-lg">
              {/* Decorative book SVG */}
              <svg viewBox="0 0 200 200" className="w-48 h-48 opacity-40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="30" width="80" height="110" rx="6" fill="#C4956A" />
                <rect x="30" y="40" width="60" height="8" rx="2" fill="white" opacity="0.7" />
                <rect x="30" y="56" width="60" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="30" y="66" width="40" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="110" y="20" width="75" height="115" rx="6" fill="#b5835a" />
                <rect x="120" y="32" width="55" height="8" rx="2" fill="white" opacity="0.7" />
                <rect x="120" y="48" width="55" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="120" y="58" width="35" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="50" y="60" width="70" height="100" rx="6" fill="#d4a574" />
                <rect x="58" y="72" width="54" height="8" rx="2" fill="white" opacity="0.7" />
                <rect x="58" y="87" width="54" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="58" y="97" width="34" height="4" rx="2" fill="white" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#222222] text-center mb-10">Built for everyone</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: '📖',
                title: 'For Readers',
                desc: 'Browse thousands of books, read them online with our built-in PDF viewer, or download for offline reading.',
                bg: 'bg-blue-50',
              },
              {
                icon: '✍️',
                title: 'For Authors',
                desc: 'Publish your books to a global audience. Track reads, downloads, and ratings with detailed analytics.',
                bg: 'bg-amber-50',
              },
            ].map(f => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">{f.title}</h3>
                <p className="text-[#666666] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-[#666666] text-sm border-t border-gray-100">
        LibraryMS © 2026
      </footer>
    </div>
  )
}
