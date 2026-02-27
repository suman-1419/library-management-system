'use client'

import { useEffect, useState } from 'react'
import UserNav from '@/components/shared/UserNav'

interface RelatedBook { title: string; coverImageUrl: string }

interface NotificationItem {
    _id: string
    type: string
    message: string
    isRead: boolean
    relatedBook?: RelatedBook
    createdAt: string
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_ICON: Record<string, string> = {
    book_approved: '✅',
    book_rejected: '❌',
    new_review: '⭐',
}

export default function UserNotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/user/notifications')
            .then(r => r.json())
            .then(d => { setNotifications(d.notifications ?? []); setLoading(false) })
    }, [])

    const unreadCount = notifications.filter(n => !n.isRead).length

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <>
            <UserNav />
            <div className="min-h-screen bg-[#FAF8F5] p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <h1 className="text-2xl font-bold text-[#222222]">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-[#C4956A] text-white text-xs font-bold rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="text-[#666666] text-center py-20">No notifications yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div key={n._id} className={`bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 ${n.isRead ? 'opacity-70' : ''}`}>
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl mt-0.5 shrink-0">{TYPE_ICON[n.type] ?? '🔔'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#222222] leading-snug">{n.message}</p>
                                            {n.relatedBook && (
                                                <p className="text-xs text-[#C4956A] mt-1">{n.relatedBook.title}</p>
                                            )}
                                            <p className="text-xs text-[#999] mt-1.5">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.isRead && (
                                            <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#C4956A] shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
