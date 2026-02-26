'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
            </div>
        </div>
    )
}

function StatusBadge({ isApproved, isPublished }: { isApproved: boolean; isPublished: boolean }) {
    if (isApproved && isPublished) {
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-900 text-emerald-300">Approved</span>
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-900 text-amber-300">Pending</span>
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
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">✍️ Author Dashboard</h1>
                <Link
                    href="/author/books/upload"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors"
                >
                    + Upload New Book
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Books" value={books.length} icon="📚" />
                <StatCard label="Total Downloads" value={totalDownloads} icon="⬇️" />
                <StatCard label="Total Reads" value={totalReads} icon="👁️" />
                <StatCard label="Avg Rating" value={avgRating} icon="⭐" />
            </div>

            {/* Books Table */}
            {books.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 mb-4">You haven't uploaded any books yet.</p>
                    <Link href="/author/books/upload" className="text-amber-400 hover:text-amber-300 font-medium">
                        Upload your first book →
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                {['Cover', 'Title', 'Category', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book, i) => (
                                <tr key={book._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                    <td className="px-4 py-3">
                                        <div className="w-10 h-14 relative rounded overflow-hidden bg-slate-700">
                                            <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{book.title}</td>
                                    <td className="px-4 py-3 text-slate-300">{book.category?.name}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge isApproved={book.isApproved} isPublished={book.isPublished} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/author/books/${book._id}/edit`}
                                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book._id, book.title)}
                                                className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}