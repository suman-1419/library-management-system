'use client'

import { useEffect, useState } from 'react'
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

const TABS = ['all', 'read', 'download'] as const
type Tab = typeof TABS[number]

export default function HistoryPage() {
    const [records, setRecords] = useState<BorrowRecord[]>([])
    const [tab, setTab] = useState<Tab>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/user/history')
            .then(r => r.json())
            .then(d => { setRecords(d.borrowRecords ?? []); setLoading(false) })
    }, [])

    const filtered = tab === 'all' ? records : records.filter(r => r.type === tab)

    return (
        <>
            <UserNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-6">Reading History</h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-[#C4956A] text-white shadow-sm' : 'bg-white text-[#666666] border border-gray-200 hover:border-[#C4956A] hover:text-[#C4956A]'
                                    }`}>
                                {t === 'all' ? 'All' : t === 'read' ? 'Reading' : 'Downloaded'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-[#666666] text-center py-20">No records yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(r => {
                                const pct = r.pageProgress > 0 ? Math.min(100, r.pageProgress) : 0
                                const isComplete = !!r.completedAt
                                return (
                                    <div key={r._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-5">
                                        <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <Image src={r.book?.coverImageUrl} alt={r.book?.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-[#222222] truncate">{r.book?.title}</p>
                                            <p className="text-[#666666] text-xs">{r.book?.author?.name}</p>
                                            {r.type === 'read' && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                                                        <div className="bg-[#C4956A] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <p className="text-xs text-[#999]">{isComplete ? 'Completed' : `${pct}% read`}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase mb-2 ${r.type === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {r.type === 'read' ? 'Read' : 'Downloaded'}
                                            </span>
                                            <p className="text-xs text-[#999]">{new Date(r.createdAt).toLocaleDateString()}</p>
                                            {r.type === 'read' && !isComplete && (
                                                <Link href={`/user/read/${r.book?._id}`}
                                                    className="mt-1.5 block text-xs text-[#C4956A] hover:underline font-medium">
                                                    Continue →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
