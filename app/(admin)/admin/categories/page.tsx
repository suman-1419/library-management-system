'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/shared/AdminNav'

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
        setAdding(true); setError('')
        const res = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
        })
        if (res.ok) { setNewName(''); setNewDesc(''); fetchCategories() }
        else { const data = await res.json(); setError(data.error ?? 'Failed to add category') }
        setAdding(false)
    }

    const handleEdit = (cat: Category) => { setEditId(cat._id); setEditName(cat.name); setEditDesc(cat.description ?? '') }

    const handleSaveEdit = async () => {
        if (!editId) return
        await fetch(`/api/admin/categories/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
        })
        setEditId(null); fetchCategories()
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"?`)) return
        const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
        if (!res.ok) { const data = await res.json(); alert(data.error ?? 'Failed to delete') }
        else fetchCategories()
    }

    const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#999] focus:outline-none focus:border-[#C4956A] focus:ring-1 focus:ring-[#C4956A]/30 transition"

    return (
        <>
            <AdminNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-6">Manage Categories</h1>

                    {/* Add Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-base font-semibold text-[#C4956A] mb-4">Add New Category</h2>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className={inputClass} />
                            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className={inputClass} />
                            <button onClick={handleAdd} disabled={adding || !newName.trim()}
                                className="flex-shrink-0 px-5 py-2.5 bg-[#C4956A] hover:bg-[#b5835a] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                                {adding ? 'Adding…' : '+ Add'}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                                    {editId === cat._id ? (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} />
                                            <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className={inputClass} />
                                            <button onClick={handleSaveEdit} className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-colors">Save</button>
                                            <button onClick={() => setEditId(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#666666] rounded-xl text-xs font-semibold transition-colors">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-[#222222]">{cat.name}</p>
                                                <p className="text-xs text-[#666666] mt-0.5">
                                                    slug: <span className="text-[#C4956A]">{cat.slug}</span>
                                                    {cat.description && <span className="ml-2">{cat.description}</span>}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => handleEdit(cat)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#666666] rounded-lg text-xs font-semibold transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(cat._id, cat.name)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {categories.length === 0 && <p className="text-[#666666] text-sm text-center py-10">No categories yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
