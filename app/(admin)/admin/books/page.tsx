'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/shared/AdminNav'

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

    const handleTabChange = (t: Tab) => { setTab(t); fetchBooks(t) }

    const handleApprove = async (id: string) => {
        await fetch(`/api/admin/books/${id}/approve`, { method: 'PATCH' })
        fetchBooks()
    }

    const handleReject = async (id: string) => {
        await fetch(`/api/admin/books/${id}/reject`, { method: 'PATCH' })
        fetchBooks()
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return
        await fetch(`/api/admin/books/${id}`, { method: 'DELETE' })
        fetchBooks()
    }

    useEffect(() => { fetchBooks() }, [])

    return (
        <>
            <AdminNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-6">Book Management</h1>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mb-6">
                        {TABS.map(t => (
                            <button
                                key={t}
                                onClick={() => handleTabChange(t)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${tab === t
                                    ? 'bg-[#C4956A] text-white shadow-sm'
                                    : 'bg-white text-[#666666] border border-gray-200 hover:border-[#C4956A] hover:text-[#C4956A]'
                                    }`}
                            >
                                {t === 'all' ? 'All Books' : t === 'pending' ? 'Pending' : 'Approved'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Title', 'Author', 'Category', 'Status', 'Added', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#666666] uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {books.map(book => (
                                        <tr key={book._id} className="hover:bg-[#FAF8F5] transition-colors">
                                            <td className="px-5 py-4 font-semibold text-[#222222] max-w-[200px] truncate">{book.title}</td>
                                            <td className="px-5 py-4 text-[#666666]">{book.author?.name}</td>
                                            <td className="px-5 py-4 text-[#666666]">{book.category?.name}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${book.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {book.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[#666666]">{new Date(book.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    {!book.isApproved && (
                                                        <button onClick={() => handleApprove(book._id)}
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                            Approve
                                                        </button>
                                                    )}
                                                    {book.isApproved && (
                                                        <button onClick={() => handleReject(book._id)}
                                                            className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                            Reject
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(book._id, book.title)}
                                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {books.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-10 text-[#666666]">No books found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
