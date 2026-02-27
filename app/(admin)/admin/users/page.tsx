'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/shared/AdminNav'

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

    const handleFilterChange = (role: RoleFilter) => { setFilter(role); fetchUsers(role) }

    const handleBlock = async (id: string) => {
        await fetch(`/api/admin/users/${id}/block`, { method: 'PATCH' })
        fetchUsers()
    }

    const handleUnblock = async (id: string) => {
        await fetch(`/api/admin/users/${id}/unblock`, { method: 'PATCH' })
        fetchUsers()
    }

    return (
        <>
            <AdminNav />
            <div className="min-h-screen bg-[#FAF8F5] p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-[#222222] mb-6">User Management</h1>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {ROLE_FILTERS.map(r => (
                            <button key={r} onClick={() => handleFilterChange(r)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${filter === r
                                        ? 'bg-[#C4956A] text-white shadow-sm'
                                        : 'bg-white text-[#666666] border border-gray-200 hover:border-[#C4956A] hover:text-[#C4956A]'
                                    }`}
                            >
                                {r === 'all' ? 'All Users' : r === 'author' ? 'Authors' : 'Readers'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#666666] uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-[#FAF8F5] transition-colors">
                                            <td className="px-5 py-4 font-semibold text-[#222222]">{u.name}</td>
                                            <td className="px-5 py-4 text-[#666666]">{u.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                                                        : u.role === 'author' ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>{u.role}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {u.isActive ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[#666666]">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4">
                                                {u.isActive ? (
                                                    <button onClick={() => handleBlock(u._id)}
                                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                        Block
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleUnblock(u._id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
                                                        Unblock
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-10 text-[#666666]">No users found.</td></tr>
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
