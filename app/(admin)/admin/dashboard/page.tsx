'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/shared/AdminNav'
import Link from 'next/link'

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

type IconColor = { bg: string; text: string }

function StatCard({ label, value, iconEl, color }: { label: string; value: number; iconEl: React.ReactNode; color: IconColor }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`h-14 w-14 rounded-xl ${color.bg} ${color.text} flex items-center justify-center flex-shrink-0`}>
                {iconEl}
            </div>
            <div>
                <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-[#222222]">{value.toLocaleString()}</h3>
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
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? 0, color: { bg: 'bg-blue-50', text: 'text-blue-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        { label: 'Authors', value: stats?.totalAuthors ?? 0, color: { bg: 'bg-purple-50', text: 'text-purple-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
        { label: 'Readers', value: stats?.totalReaders ?? 0, color: { bg: 'bg-orange-50', text: 'text-orange-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
        { label: 'Total Books', value: stats?.totalBooks ?? 0, color: { bg: 'bg-amber-50', text: 'text-amber-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
        { label: 'Pending', value: stats?.pendingBooks ?? 0, color: { bg: 'bg-yellow-50', text: 'text-yellow-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
        { label: 'Downloads', value: stats?.totalDownloads ?? 0, color: { bg: 'bg-green-50', text: 'text-green-600' }, iconEl: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
    ]

    return (
        <>
            <AdminNav />
            <div className="min-h-screen bg-[#FAF8F5] p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-[#222222] mb-8">Dashboard</h1>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {statCards.map(c => (
                            <StatCard key={c.label} label={c.label} value={c.value} iconEl={c.iconEl} color={c.color} />
                        ))}
                    </div>

                    {/* Bottom 2-col */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Pending Approvals */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                <h2 className="font-bold text-[#222222]">Pending Book Approvals</h2>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                                    Action Required
                                </span>
                            </div>
                            {pendingBooks.length === 0 ? (
                                <p className="text-[#666666] text-sm text-center py-10">No pending books.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Book Title', 'Author', 'Status', 'Decisions'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#666666] uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pendingBooks.map(b => (
                                            <tr key={b._id} className="hover:bg-[#FAF8F5] transition-colors">
                                                <td className="px-5 py-4 font-semibold text-[#222222]">{b.title}</td>
                                                <td className="px-5 py-4 text-[#666666]">{b.author?.name}</td>
                                                <td className="px-5 py-4">
                                                    <span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-700">Reviewing</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleApprove(b._id)}
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => handleReject(b._id)}
                                                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Recent Registrations */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-[#222222]">New Registrations</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {(stats?.recentUsers ?? []).slice(0, 5).map(u => (
                                    <div key={u._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-[#222222]">{u.name}</p>
                                            <p className="text-xs text-[#666666]">{u.email}</p>
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === 'author' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {u.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="px-5 py-3 border-t border-gray-100">
                                <Link href="/admin/users" className="text-xs text-[#C4956A] hover:underline font-medium">View All Users →</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}