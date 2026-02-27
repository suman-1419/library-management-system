'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AuthorNav from '@/components/shared/AuthorNav'

interface BookRow {
    _id: string
    title: string
    coverImageUrl: string
    category: { name: string }
    isApproved: boolean
    isPublished: boolean
    totalReads: number
    totalDownloads: number
    averageRating: number
    createdAt: string
}

function StatusBadge({ isApproved, isPublished }: { isApproved: boolean; isPublished: boolean }) {
    if (isApproved && isPublished)
        return <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-green-100 text-green-700">Approved</span>
    if (isApproved && !isPublished)
        return <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
    return <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">Rejected</span>
}

export default function AuthorDashboard() {
    const [books, setBooks] = useState<BookRow[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBooks = async () => {
        const res = await fetch('/api/author/books')
        const data = await res.json()
        setBooks(data.books ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchBooks() }, [])

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This will permanently remove all files.`)) return
        await fetch(`/api/author/books/${id}`, { method: 'DELETE' })
        await fetchBooks()
    }

    const totalReads = books.reduce((s, b) => s + b.totalReads, 0)
    const totalDownloads = books.reduce((s, b) => s + b.totalDownloads, 0)
    const avgRating = books.length
        ? (books.reduce((s, b) => s + b.averageRating, 0) / books.length).toFixed(1)
        : '—'

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Books', value: books.length, bg: 'bg-blue-50', text: 'text-blue-600', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
        { label: 'Total Downloads', value: totalDownloads, bg: 'bg-amber-50', text: 'text-[#C4956A]', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
        { label: 'Total Reads', value: totalReads, bg: 'bg-purple-50', text: 'text-purple-600', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
        { label: 'Avg Rating', value: avgRating, bg: 'bg-orange-50', text: 'text-orange-500', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
    ]

    return (
        <>
            <AuthorNav />
            <div className="min-h-screen bg-[#FAF8F5] p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-[#222222]">Author Dashboard</h1>
                            <p className="text-[#666666] text-sm mt-1">Manage your publications and track book performance.</p>
                        </div>
                        <Link
                            href="/author/books/upload"
                            className="px-5 py-2.5 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
                        >
                            + Upload New Book
                        </Link>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mb-8">
                        {statCards.map(c => (
                            <div key={c.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
                                    {c.icon}
                                </div>
                                <p className="text-2xl font-bold text-[#222222]">{c.value}</p>
                                <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mt-0.5">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Books Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="font-bold text-[#222222]">Recently Uploaded Books</h2>
                            <Link href="/author/books/upload" className="text-xs text-[#C4956A] hover:underline font-medium">View All</Link>
                        </div>
                        {books.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-[#666666] mb-3">You haven&apos;t uploaded any books yet.</p>
                                <Link href="/author/books/upload" className="text-[#C4956A] hover:underline font-medium">Upload your first book →</Link>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Book Details', 'Category', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#666666] uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {books.map(book => (
                                        <tr key={book._id} className="hover:bg-[#FAF8F5] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#222222] truncate max-w-[180px]">{book.title}</p>
                                                        <p className="text-xs text-[#666666] mt-0.5">ID: #BK-{book._id.slice(-4).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[#666666]">{book.category?.name}</td>
                                            <td className="px-5 py-4">
                                                <StatusBadge isApproved={book.isApproved} isPublished={book.isPublished} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <Link href={`/author/books/${book._id}/edit`}
                                                        className="p-1.5 text-[#666666] hover:text-[#C4956A] rounded-lg hover:bg-amber-50 transition-colors">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </Link>
                                                    <button onClick={() => handleDelete(book._id, book.title)}
                                                        className="p-1.5 text-[#666666] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
