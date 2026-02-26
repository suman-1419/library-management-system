'use client'

import { useEffect, useState } from 'react'

interface Category {
    _id: string
    name: string
    slug: string
    description?: string
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [error, setError] = useState('')

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        setCategories(data.categories ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchCategories() }, [])

    const handleAdd = async () => {
        if (!newName.trim()) return
        setAdding(true)
        setError('')
        const res = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
        })
        if (res.ok) {
            setNewName('')
            setNewDesc('')
            fetchCategories()
        } else {
            const data = await res.json()
            setError(data.error ?? 'Failed to add category')
        }
        setAdding(false)
    }

    const handleEdit = (cat: Category) => {
        setEditId(cat._id)
        setEditName(cat.name)
        setEditDesc(cat.description ?? '')
    }

    const handleSaveEdit = async () => {
        if (!editId) return
        await fetch(`/api/admin/categories/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
        })
        setEditId(null)
        fetchCategories()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return
        const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
        if (!res.ok) {
            const data = await res.json()
            alert(data.error ?? 'Failed to delete')
        } else {
            fetchCategories()
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <h1 className="text-2xl font-bold mb-6">🗂️ Category Management</h1>

            {/* Add Category Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
                <h2 className="text-base font-semibold mb-4 text-amber-400">Add New Category</h2>
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !newName.trim()}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
                    >
                        {adding ? 'Adding…' : '+ Add Category'}
                    </button>
                </div>
            </div>

            {/* Category List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map(cat => (
                        <div
                            key={cat._id}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
                        >
                            {editId === cat._id ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                                    />
                                    <input
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                                    />
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditId(null)}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{cat.name}</p>
                                        <p className="text-slate-400 text-xs mt-0.5">
                                            slug: <span className="text-amber-400">{cat.slug}</span>
                                            {cat.description && <span className="ml-3 text-slate-500">{cat.description}</span>}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id, cat.name)}
                                            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-slate-500 text-sm text-center py-10">No categories yet.</p>
                    )}
                </div>
            )}
        </div>
    )
}
