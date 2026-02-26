'use client'

import { useEffect, useState } from 'react'

interface UserRow {
    _id: string
    name: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
}

const ROLE_FILTERS = ['all', 'author', 'user'] as const
type RoleFilter = typeof ROLE_FILTERS[number]

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([])
    const [filter, setFilter] = useState<RoleFilter>('all')
    const [loading, setLoading] = useState(true)

    const fetchUsers = async (role: RoleFilter = filter) => {
        setLoading(true)
        const res = await fetch(`/api/admin/users?role=${role}`)
        const data = await res.json()
        setUsers(data.users ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchUsers() }, [])

    const handleFilterChange = (role: RoleFilter) => {
        setFilter(role)
        fetchUsers(role)
    }

    const handleBlock = async (id: string) => {
        await fetch(`/api/admin/users/${id}/block`, { method: 'PATCH' })
        fetchUsers()
    }

    const handleUnblock = async (id: string) => {
        await fetch(`/api/admin/users/${id}/unblock`, { method: 'PATCH' })
        fetchUsers()
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-6">👥 User Management</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {ROLE_FILTERS.map(r => (
                    <button
                        key={r}
                        onClick={() => handleFilterChange(r)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === r
                                ? 'bg-amber-500 text-slate-900'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {r === 'all' ? 'All Users' : r === 'author' ? 'Authors' : 'Readers'}
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
                                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u._id} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}>
                                    <td className="px-4 py-3 font-medium">{u.name}</td>
                                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-900 text-purple-300' :
                                                u.role === 'author' ? 'bg-blue-900 text-blue-300' :
                                                    'bg-slate-700 text-slate-300'
                                            }`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                                            }`}>
                                            {u.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {u.isActive ? (
                                            <button
                                                onClick={() => handleBlock(u._id)}
                                                className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Block
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUnblock(u._id)}
                                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Unblock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
