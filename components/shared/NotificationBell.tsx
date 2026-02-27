'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface RelatedBook { title: string }

interface NotifItem {
    _id: string
    message: string
    isRead: boolean
    relatedBook?: RelatedBook
    createdAt: string
    type: string
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

interface Props { role: 'author' | 'user' }

export default function NotificationBell({ role }: Props) {
    const [notifications, setNotifications] = useState<NotifItem[]>([])
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const endpoint = role === 'author' ? '/api/author/notifications' : '/api/user/notifications'
    const allLink = role === 'author' ? '/author/notifications' : '/user/notifications'

    const fetchNotifs = async () => {
        try {
            const res = await fetch(endpoint)
            const data = await res.json()
            setNotifications(data.notifications ?? [])
        } catch { /* silently ignore */ }
    }

    useEffect(() => {
        fetchNotifs()
        const interval = setInterval(fetchNotifs, 60_000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const unread = notifications.filter(n => !n.isRead).length
    const preview = notifications.slice(0, 5)

    const markRead = async (id: string, isRead: boolean) => {
        if (role !== 'author' || isRead) return
        await fetch(`/api/author/notifications/${id}/read`, { method: 'PATCH' })
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                {/* Bell SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#666666]">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#222222]">Notifications</span>
                        {unread > 0 && (
                            <span className="text-xs bg-[#C4956A] text-white px-2 py-0.5 rounded-full font-bold">
                                {unread} new
                            </span>
                        )}
                    </div>

                    {preview.length === 0 ? (
                        <p className="text-center text-[#666666] text-sm py-6">No notifications yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                            {preview.map(n => (
                                <button
                                    key={n._id}
                                    onClick={() => markRead(n._id, n.isRead)}
                                    className={`w-full text-left px-4 py-3 hover:bg-[#FAF8F5] transition-colors ${n.isRead ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#222222] leading-snug">{n.message}</p>
                                            {n.relatedBook && (
                                                <p className="text-xs text-[#C4956A] mt-0.5 truncate">{n.relatedBook.title}</p>
                                            )}
                                            <p className="text-xs text-[#666666] mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.isRead && (
                                            <span className="mt-1 w-2 h-2 rounded-full bg-[#C4956A] shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-2.5 border-t border-gray-100">
                        <Link
                            href={allLink}
                            onClick={() => setOpen(false)}
                            className="text-xs text-[#C4956A] hover:underline font-medium"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
