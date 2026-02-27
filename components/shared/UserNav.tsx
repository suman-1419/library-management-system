'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import NotificationBell from '@/components/shared/NotificationBell'

const NAV_LINKS = [
    { href: '/user/dashboard', label: 'Dashboard' },
    { href: '/user/browse', label: 'Browse' },
    { href: '/user/history', label: 'History' },
    { href: '/user/notifications', label: 'Notifications' },
]

export default function UserNav() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/user/dashboard" className="text-xl sm:text-2xl font-bold tracking-tighter flex-shrink-0">
                    <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-5">
                    {NAV_LINKS.map(link => {
                        const active = pathname === link.href
                        return (
                            <Link key={link.href} href={link.href}
                                className={`text-sm font-medium transition-colors pb-0.5 ${active
                                    ? 'text-[#C4956A] border-b-2 border-[#C4956A]'
                                    : 'text-[#666666] hover:text-[#222222]'}`}>
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3">
                        <NotificationBell role="user" />
                        <UserButton />
                    </div>

                    {/* Hamburger */}
                    <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round">
                            {open ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {open && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="flex flex-col px-4 py-3 gap-1">
                        {NAV_LINKS.map(link => {
                            const active = pathname === link.href
                            return (
                                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active
                                        ? 'bg-amber-50 text-[#C4956A] font-semibold'
                                        : 'text-[#666666] hover:bg-gray-50'}`}>
                                    {link.label}
                                </Link>
                            )
                        })}
                        <div className="pt-2 pb-1 px-3 border-t border-gray-100 mt-1 flex items-center gap-3">
                            <NotificationBell role="user" />
                            <UserButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
