'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

interface Category { _id: string; name: string }

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Other']

export default function EditBookPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [language, setLanguage] = useState('English')
    const [tags, setTags] = useState('')
    const [currentCover, setCurrentCover] = useState('')
    const coverRef = useRef<HTMLInputElement>(null)
    const pdfRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/categories').then(r => r.json()),
            fetch('/api/author/books').then(r => r.json()),
        ]).then(([catData, booksData]) => {
            setCategories(catData.categories ?? [])
            const book = (booksData.books ?? []).find((b: { _id: string }) => b._id === id)
            if (book) {
                setTitle(book.title)
                setDescription(book.description)
                setCategoryId(book.category?._id ?? '')
                setLanguage(book.language ?? 'English')
                setTags((book.tags ?? []).join(', '))
                setCurrentCover(book.coverImageUrl)
            }
            setFetching(false)
        })
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const coverFile = coverRef.current?.files?.[0]
        const pdfFile = pdfRef.current?.files?.[0]

        if (coverFile && coverFile.size > 5 * 1024 * 1024) { setError('Cover image must be ≤ 5MB.'); setLoading(false); return }
        if (pdfFile && pdfFile.size > 50 * 1024 * 1024) { setError('PDF must be ≤ 50MB.'); setLoading(false); return }

        const form = new FormData()
        form.append('title', title)
        form.append('description', description)
        form.append('categoryId', categoryId)
        form.append('language', language)
        form.append('tags', tags)
        if (coverFile) form.append('coverImage', coverFile)
        if (pdfFile) form.append('bookPdf', pdfFile)

        const res = await fetch(`/api/author/books/${id}`, { method: 'PATCH', body: form })
        if (res.ok) {
            router.push('/author/dashboard')
        } else {
            const data = await res.json()
            setError(data.error ?? 'Update failed.')
            setLoading(false)
        }
    }

    const fieldClass = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
    const labelClass = "block text-slate-300 text-sm font-medium mb-1.5"

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">✏️ Edit Book</h1>

                {/* Re-approval warning */}
                <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-xl text-amber-300 text-sm">
                    ⚠️ <strong>Note:</strong> Editing this book will reset its approval status to <strong>Pending</strong>. An admin will need to re-approve it before it goes live.
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={fieldClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            rows={4} className={`${fieldClass} resize-none`} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={fieldClass}>
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Language</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className={fieldClass}>
                                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Tags <span className="text-slate-500">(comma-separated)</span></label>
                        <input value={tags} onChange={e => setTags(e.target.value)} className={fieldClass} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>New Cover Image <span className="text-slate-500">(optional, max 5MB)</span></label>
                            {currentCover && (
                                <Image src={currentCover} alt="Current cover" width={80} height={100} className="object-cover rounded mb-2 border border-slate-600" />
                            )}
                            <input ref={coverRef} type="file" accept="image/*"
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:font-semibold hover:file:bg-slate-600 cursor-pointer" />
                        </div>
                        <div>
                            <label className={labelClass}>New PDF <span className="text-slate-500">(optional, max 50MB)</span></label>
                            <input ref={pdfRef} type="file" accept=".pdf"
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:font-semibold hover:file:bg-slate-600 cursor-pointer" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl transition-colors">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    Saving…
                                </span>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
