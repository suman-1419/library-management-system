'use client'

import { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts'

interface BookStat {
    _id: string
    title: string
    totalReads: number
    totalDownloads: number
    author: { name: string }
}

interface StatsData {
    mostReadBooks: BookStat[]
    mostDownloadedBooks: BookStat[]
}

export default function AdminReportsPage() {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false) })
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const readData = (stats?.mostReadBooks ?? []).map(b => ({
        name: b.title.length > 20 ? b.title.slice(0, 20) + '…' : b.title,
        reads: b.totalReads,
    }))

    const downloadData = (stats?.mostDownloadedBooks ?? []).map(b => ({
        name: b.title.length > 20 ? b.title.slice(0, 20) + '…' : b.title,
        downloads: b.totalDownloads,
    }))

    const tooltipStyle = {
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f1f5f9',
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-2">📊 Reports & Analytics</h1>
            <p className="text-slate-400 text-sm mb-10">Visual breakdown of library activity</p>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Most Read */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-amber-400 mb-6">🔥 Top Books by Reads</h2>
                    {readData.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-10">No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={readData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: 'rgba(251,191,36,0.08)' }}
                                />
                                <Bar dataKey="reads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Most Downloaded */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-amber-400 mb-6">⬇️ Top Books by Downloads</h2>
                    {downloadData.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-10">No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={downloadData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: 'rgba(251,191,36,0.08)' }}
                                />
                                <Bar dataKey="downloads" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}
