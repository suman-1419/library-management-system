'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

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

const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
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
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
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

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-2">📊 Analytics</h1>
            <p className="text-slate-400 text-sm mb-8">Performance stats across all your books</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Books" value={data?.books.length ?? 0} icon="📚" />
                <StatCard label="Total Reads" value={data?.totalReads ?? 0} icon="👁️" />
                <StatCard label="Total Downloads" value={data?.totalDownloads ?? 0} icon="⬇️" />
                <StatCard label="Avg Rating" value={avgRating} icon="⭐" />
            </div>

            {/* Bar Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
                <h2 className="text-base font-semibold text-amber-400 mb-6">Reads vs Downloads per Book</h2>
                {chartData.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-10">No data yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(251,191,36,0.06)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                            <Bar dataKey="Reads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Downloads" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Books Table + Star Breakdown side by side */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Books Table */}
                <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                {['Title', 'Reads', 'Downloads', 'Avg Rating', 'Reviews'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.books ?? []).map((b, i) => (
                                <tr key={b._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                    <td className="px-4 py-3 font-medium max-w-[150px] truncate">{b.title}</td>
                                    <td className="px-4 py-3 text-amber-400">{b.totalReads}</td>
                                    <td className="px-4 py-3 text-sky-400">{b.totalDownloads}</td>
                                    <td className="px-4 py-3">⭐ {b.averageRating.toFixed(1)}</td>
                                    <td className="px-4 py-3 text-slate-300">{b.totalReviews}</td>
                                </tr>
                            ))}
                            {(data?.books ?? []).length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-500">No books yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Star Breakdown */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-amber-400 mb-5">Star Rating Breakdown</h2>
                    <div className="space-y-3">
                        {stars.map(s => {
                            const count = data?.starBreakdown[s] ?? 0
                            const pct = Math.round((count / maxStarCount) * 100)
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <span className="text-slate-300 text-sm w-8 text-right font-medium">{s} ★</span>
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-slate-300 text-xs w-6 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
