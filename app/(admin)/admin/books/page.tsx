'use client'

import { useEffect, useState } from 'react'

interface BookRow {
    _id: string
    title: string
    author: { name: string; email: string }
    category: { name: string }
    isApproved: boolean
    isPublished: boolean
    createdAt: string
}

const TABS = ['all', 'pending', 'approved'] as const
type Tab = typeof TABS[number]

export default function AdminBooksPage() {
    const [books, setBooks] = useState<BookRow[]>([])
    const [tab, setTab] = useState<Tab>('all')
    const [loading, setLoading] = useState(true)

    const fetchBooks = async (status: Tab = tab) => {
        setLoading(true)
        const res = await fetch(`/api/admin/books?status=${status}`)
        const data = await res.json()
        setBooks(data.books ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchBooks() }, [])

    const handleTabChange = (t: Tab) => {
        setTab(t)
        fetchBooks(t)
    }

    const handleApprove = async (id: string) => {
        await fetch(`/api/admin/books/${id}/approve`, { method: 'PATCH' })
        await fetchBooks()
    }

    const handleReject = async (id: string) => {
        await fetch(`/api/admin/books/${id}/reject`, { method: 'PATCH' })
        await fetchBooks()
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete book "${title}"? This will also remove files from Cloudinary.`)) return
        await fetch(`/api/admin/books/${id}`, { method: 'DELETE' })
        await fetchBooks()
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-6">📚 Book Management</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => handleTabChange(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {t === 'all' ? 'All Books' : t === 'pending' ? 'Pending' : 'Approved'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                {['Title', 'Author', 'Category', 'Status', 'Added', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book, i) => (
                                <tr key={book._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{book.title}</td>
                                    <td className="px-4 py-3 text-slate-300">{book.author?.name}</td>
                                    <td className="px-4 py-3 text-slate-300">{book.category?.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${book.isApproved ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                                            }`}>
                                            {book.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">{new Date(book.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {!book.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(book._id)}
                                                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-semibold transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {book.isApproved && (
                                                <button
                                                    onClick={() => handleReject(book._id)}
                                                    className="px-2 py-1 bg-amber-700 hover:bg-amber-600 rounded text-xs font-semibold transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(book._id, book.title)}
                                                className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs font-semibold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {books.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500">No books found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
