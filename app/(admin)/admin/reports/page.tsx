'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from 'recharts'
import AdminNav from '@/components/shared/AdminNav'

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
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
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
        backgroundColor: '#ffffff',
        border: '1px solid #f3f4f6',
        borderRadius: '12px',
        color: '#222222',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    }

    return (
        <>
            <AdminNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-2">Reports & Analytics</h1>
                    <p className="text-[#666666] text-sm mb-8">Visual breakdown of library activity</p>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-semibold text-[#C4956A] mb-6">Top Books by Reads</h2>
                            {readData.length === 0 ? (
                                <p className="text-[#666666] text-sm text-center py-10">No data yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={readData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tick={{ fill: '#666666', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fill: '#666666', fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(196,149,106,0.08)' }} />
                                        <Bar dataKey="reads" fill="#C4956A" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-semibold text-[#C4956A] mb-6">Top Books by Downloads</h2>
                            {downloadData.length === 0 ? (
                                <p className="text-[#666666] text-sm text-center py-10">No data yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={downloadData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tick={{ fill: '#666666', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fill: '#666666', fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(245,158,11,0.08)' }} />
                                        <Bar dataKey="downloads" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
