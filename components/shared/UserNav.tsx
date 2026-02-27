'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import NotificationBell from '@/components/shared/NotificationBell'

const NAV_LINKS = [
    { href: '/user/dashboard', label: 'Dashboard' },
    { href: '/user/browse', label: 'Browse' },
    { href: '/user/history', label: 'History' },
    { href: '/user/notifications', label: 'Notifications' },
]

export default function UserNav() {
    const pathname = usePathname()
    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/user/dashboard" className="text-2xl font-bold tracking-tighter flex-shrink-0">
                    <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    {NAV_LINKS.map(link => {
                        const active = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors pb-0.5 ${active
                                        ? 'text-[#C4956A] border-b-2 border-[#C4956A]'
                                        : 'text-[#666666] hover:text-[#222222]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <NotificationBell role="user" />
                    <UserButton />
                </div>
            </div>
        </nav>
    )
}
