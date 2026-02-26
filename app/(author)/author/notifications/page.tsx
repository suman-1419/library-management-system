'use client'

import { useEffect, useState } from 'react'

interface RelatedBook { title: string; coverImageUrl: string }

interface NotificationItem {
    _id: string
    type: 'book_approved' | 'book_rejected' | 'new_review'
    message: string
    isRead: boolean
    relatedBook?: RelatedBook
    createdAt: string
}

const TYPE_ICON: Record<NotificationItem['type'], string> = {
    book_approved: '✅',
    book_rejected: '❌',
    new_review: '⭐',
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function AuthorNotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        const res = await fetch('/api/author/notifications')
        const data = await res.json()
        setNotifications(data.notifications ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchNotifications() }, [])

    const markRead = async (id: string) => {
        await fetch(`/api/author/notifications/${id}/read`, { method: 'PATCH' })
        setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        )
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-2xl font-bold">🔔 Notifications</h1>
                {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                        {unreadCount} new
                    </span>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="text-slate-500 text-center py-20">No notifications yet.</p>
            ) : (
                <div className="space-y-3 max-w-2xl">
                    {notifications.map(n => (
                        <button
                            key={n._id}
                            onClick={() => !n.isRead && markRead(n._id)}
                            className={`w-full text-left rounded-xl border px-5 py-4 transition-colors cursor-pointer ${n.isRead
                                    ? 'bg-slate-800/50 border-slate-700'
                                    : 'bg-slate-800 border-slate-600 hover:border-amber-600'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <span className="text-2xl mt-0.5">{TYPE_ICON[n.type]}</span>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-100">{n.message}</p>
                                    {n.relatedBook && (
                                        <p className="text-xs text-amber-400 mt-1">📖 {n.relatedBook.title}</p>
                                    )}
                                    <p className="text-xs text-slate-500 mt-1.5">{timeAgo(n.createdAt)}</p>
                                </div>

                                {/* Unread dot */}
                                {!n.isRead && (
                                    <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
