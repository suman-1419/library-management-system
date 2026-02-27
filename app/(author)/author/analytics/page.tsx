'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import AuthorNav from '@/components/shared/AuthorNav'

interface BookStat {
    _id: string
    title: string
    totalReads: number
    totalDownloads: number
    averageRating: number
    totalReviews: number
}

interface Analytics {
    books: BookStat[]
    totalReads: number
    totalDownloads: number
    starBreakdown: Record<string, number>
}

export default function AuthorAnalyticsPage() {
    const [data, setData] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/author/analytics')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const avgRating = data && data.books.length
        ? (data.books.reduce((s, b) => s + b.averageRating, 0) / data.books.length).toFixed(1)
        : '—'

    const chartData = (data?.books ?? []).map(b => ({
        name: b.title.length > 18 ? b.title.slice(0, 18) + '…' : b.title,
        Reads: b.totalReads,
        Downloads: b.totalDownloads,
    }))

    const stars = [5, 4, 3, 2, 1]
    const maxStarCount = Math.max(...stars.map(s => data?.starBreakdown[s] ?? 0), 1)

    const tooltipStyle = {
        backgroundColor: '#ffffff',
        border: '1px solid #f3f4f6',
        borderRadius: '12px',
        color: '#222222',
    }

    const statCards = [
        { label: 'Total Books', value: data?.books.length ?? 0, bg: 'bg-blue-50', text: 'text-blue-600' },
        { label: 'Total Reads', value: data?.totalReads ?? 0, bg: 'bg-purple-50', text: 'text-purple-600' },
        { label: 'Total Downloads', value: data?.totalDownloads ?? 0, bg: 'bg-amber-50', text: 'text-[#C4956A]' },
        { label: 'Avg Rating', value: avgRating, bg: 'bg-orange-50', text: 'text-orange-500' },
    ]

    return (
        <>
            <AuthorNav />
            <div className="min-h-screen bg-[#FAF8F5] p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-[#222222] mb-1">Analytics</h1>
                    <p className="text-[#666666] text-sm mb-8">Performance stats across all your books</p>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {statCards.map(c => (
                            <div key={c.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center text-lg font-bold mb-3`}>
                                    {c.label === 'Total Books' ? '📚' : c.label === 'Total Reads' ? '👁' : c.label === 'Total Downloads' ? '↓' : '★'}
                                </div>
                                <p className="text-2xl font-bold text-[#222222]">{c.value}</p>
                                <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mt-0.5">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
                        <h2 className="text-base font-semibold text-[#C4956A] mb-6">Reads vs Downloads per Book</h2>
                        {chartData.length === 0 ? (
                            <p className="text-[#666666] text-sm text-center py-10">No data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fill: '#666666', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fill: '#666666', fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(196,149,106,0.06)' }} />
                                    <Legend wrapperStyle={{ color: '#666666', fontSize: 12 }} />
                                    <Bar dataKey="Reads" fill="#C4956A" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Downloads" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Books Table + Star Breakdown */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Title', 'Reads', 'Downloads', 'Avg Rating', 'Reviews'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[#666666] uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(data?.books ?? []).map(b => (
                                        <tr key={b._id} className="hover:bg-[#FAF8F5] transition-colors">
                                            <td className="px-4 py-3 font-medium text-[#222222] max-w-[150px] truncate">{b.title}</td>
                                            <td className="px-4 py-3 text-[#C4956A] font-semibold">{b.totalReads}</td>
                                            <td className="px-4 py-3 text-amber-500 font-semibold">{b.totalDownloads}</td>
                                            <td className="px-4 py-3 text-[#666666]">★ {b.averageRating.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-[#666666]">{b.totalReviews}</td>
                                        </tr>
                                    ))}
                                    {(data?.books ?? []).length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-10 text-[#666666]">No books yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Star Breakdown */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-semibold text-[#C4956A] mb-5">Star Rating Breakdown</h2>
                            <div className="space-y-3">
                                {stars.map(s => {
                                    const count = data?.starBreakdown[s] ?? 0
                                    const pct = Math.round((count / maxStarCount) * 100)
                                    return (
                                        <div key={s} className="flex items-center gap-3">
                                            <span className="text-[#666666] text-sm w-8 text-right font-medium">{s} ★</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                <div className="bg-[#C4956A] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[#666666] text-xs w-6 text-right">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
