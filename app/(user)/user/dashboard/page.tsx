'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import UserNav from '@/components/shared/UserNav'

interface BookRef {
  _id: string
  title: string
  coverImageUrl: string
  author: { name: string }
}

interface BorrowRecord {
  _id: string
  book: BookRef
  type: 'read' | 'download'
  pageProgress: number
  completedAt: string | null
  createdAt: string
}

export default function UserDashboard() {
  const { user } = useUser()
  const [records, setRecords] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/user/history').then(r => r.json()),
      fetch('/api/user/notifications').then(r => r.json()),
    ]).then(([histData, notifData]) => {
      setRecords(histData.borrowRecords ?? [])
      const unreadCount = (notifData.notifications ?? []).filter((n: { isRead: boolean }) => !n.isRead).length
      setUnread(unreadCount)
      setLoading(false)
    })
  }, [])

  const reading = records.filter(r => r.type === 'read' && !r.completedAt)
  const downloads = records.filter(r => r.type === 'download').slice(0, 4)

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
        <div className="max-w-7xl mx-auto">
          {/* Welcome card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Welcome back, {user?.firstName ?? 'Reader'}!</h1>
              <p className="text-[#666666] text-sm mt-1">What will you read today?</p>
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <Link href="/user/notifications" className="text-xs text-[#C4956A] font-semibold border border-[#C4956A]/30 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                  {unread} new notification{unread > 1 ? 's' : ''}
                </Link>
              )}
              <Link href="/user/browse"
                className="px-5 py-2.5 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                Browse Books
              </Link>
            </div>
          </div>

          {/* Continue Reading */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#222222] mb-4">Continue Reading</h2>
            {reading.length === 0 ? (
              <p className="text-[#666666] text-sm">No books in progress. <Link href="/user/browse" className="text-[#C4956A] hover:underline">Browse library →</Link></p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reading.map(r => {
                  const pct = r.pageProgress > 0 ? Math.min(100, r.pageProgress) : 0
                  return (
                    <div key={r._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex gap-4 items-start">
                      <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={r.book.coverImageUrl} alt={r.book.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm text-[#222222]">{r.book.title}</p>
                        <p className="text-[#666666] text-xs mb-2">{r.book.author?.name}</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                          <div className="bg-[#C4956A] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-[#999] mb-2">{pct}% complete</p>
                        <Link href={`/user/read/${r.book._id}`}
                          className="text-xs px-3 py-1 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-lg transition-colors">
                          Continue →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Recently Downloaded */}
          <section>
            <h2 className="text-lg font-bold text-[#222222] mb-4">Recently Downloaded</h2>
            {downloads.length === 0 ? (
              <p className="text-[#666666] text-sm">No downloads yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {downloads.map(r => (
                  <Link key={r._id} href={`/user/books/${r.book._id}`} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative w-full h-36 bg-gray-100">
                      <Image src={r.book.coverImageUrl} alt={r.book.title} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-[#222222] truncate">{r.book.title}</p>
                      <p className="text-xs text-[#666666] mt-0.5">{r.book.author?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}