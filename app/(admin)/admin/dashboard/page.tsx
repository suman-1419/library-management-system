'use client'

import { useEffect, useState } from 'react'

interface StatData {
    totalUsers: number
    totalAuthors: number
    totalReaders: number
    totalBooks: number
    pendingBooks: number
    approvedBooks: number
    totalDownloads: number
    totalReads: number
    mostReadBooks: { _id: string; title: string; totalReads: number; author: { name: string } }[]
    mostDownloadedBooks: { _id: string; title: string; totalDownloads: number; author: { name: string } }[]
    recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string }[]
}

interface PendingBook {
    _id: string
    title: string
    author: { name: string; email: string }
    category: { name: string }
    createdAt: string
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-white text-2xl font-bold mt-0.5">{value.toLocaleString()}</p>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<StatData | null>(null)
    const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        const [statsRes, booksRes] = await Promise.all([
            fetch('/api/admin/stats'),
            fetch('/api/admin/books?status=pending'),
        ])
        const statsData = await statsRes.json()
        const booksData = await booksRes.json()
        setStats(statsData)
        setPendingBooks(booksData.books ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleApprove = async (id: string) => {
        await fetch(`/api/admin/books/${id}/approve`, { method: 'PATCH' })
        fetchData()
    }

    const handleReject = async (id: string) => {
        await fetch(`/api/admin/books/${id}/reject`, { method: 'PATCH' })
        fetchData()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-8">👑 Admin Dashboard</h1>

            {/* Stat Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                    <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
                    <StatCard label="Authors" value={stats.totalAuthors} icon="✍️" />
                    <StatCard label="Readers" value={stats.totalReaders} icon="📖" />
                    <StatCard label="Total Books" value={stats.totalBooks} icon="📚" />
                    <StatCard label="Pending" value={stats.pendingBooks} icon="⏳" />
                    <StatCard label="Downloads" value={stats.totalDownloads} icon="⬇️" />
                </div>
            )}

            {/* Pending Books */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4 text-amber-400">⏳ Pending Approval ({pendingBooks.length})</h2>
                {pendingBooks.length === 0 ? (
                    <p className="text-slate-500 text-sm">No books pending approval.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                                <tr>
                                    {['Title', 'Author', 'Category', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pendingBooks.map((book, i) => (
                                    <tr key={book._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                        <td className="px-4 py-3 font-medium">{book.title}</td>
                                        <td className="px-4 py-3 text-slate-300">{book.author?.name}</td>
                                        <td className="px-4 py-3 text-slate-300">{book.category?.name}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => handleApprove(book._id)}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(book._id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Most Read & Downloaded */}
            {stats && (
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <section>
                        <h2 className="text-lg font-semibold mb-4 text-amber-400">🔥 Most Read Books</h2>
                        <div className="space-y-2">
                            {stats.mostReadBooks.map((b, i) => (
                                <div key={b._id} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
                                    <div>
                                        <span className="text-slate-500 text-xs mr-2">#{i + 1}</span>
                                        <span className="font-medium">{b.title}</span>
                                        <span className="text-slate-400 text-xs ml-2">by {b.author?.name}</span>
                                    </div>
                                    <span className="text-amber-400 font-semibold text-sm">{b.totalReads} reads</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-semibold mb-4 text-amber-400">⬇️ Most Downloaded</h2>
                        <div className="space-y-2">
                            {stats.mostDownloadedBooks.map((b, i) => (
                                <div key={b._id} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
                                    <div>
                                        <span className="text-slate-500 text-xs mr-2">#{i + 1}</span>
                                        <span className="font-medium">{b.title}</span>
                                        <span className="text-slate-400 text-xs ml-2">by {b.author?.name}</span>
                                    </div>
                                    <span className="text-amber-400 font-semibold text-sm">{b.totalDownloads} downloads</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Recent Registrations */}
            {stats && (
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-amber-400">🆕 Recent Registrations</h2>
                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                                <tr>
                                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentUsers.map((u, i) => (
                                    <tr key={u._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                        <td className="px-4 py-3 text-slate-300">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-900 text-purple-300' :
                                                    u.role === 'author' ? 'bg-blue-900 text-blue-300' :
                                                        'bg-slate-700 text-slate-300'
                                                }`}>{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}