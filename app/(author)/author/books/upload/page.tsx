'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthorNav from '@/components/shared/AuthorNav'

interface Category { _id: string; name: string }

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Other']

export default function UploadBookPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [language, setLanguage] = useState('English')
    const [tags, setTags] = useState('')
    const coverRef = useRef<HTMLInputElement>(null)
    const pdfRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(r => r.json())
            .then(d => setCategories(d.categories ?? []))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const coverFile = coverRef.current?.files?.[0]
        const pdfFile = pdfRef.current?.files?.[0]
        if (!title || !description || !categoryId || !language || !coverFile || !pdfFile) { setError('All fields are required.'); return }
        if (coverFile.size > 5 * 1024 * 1024) { setError('Cover image must be ≤ 5MB.'); return }
        if (pdfFile.size > 50 * 1024 * 1024) { setError('PDF must be ≤ 50MB.'); return }
        setLoading(true)
        const form = new FormData()
        form.append('title', title)
        form.append('description', description)
        form.append('categoryId', categoryId)
        form.append('language', language)
        form.append('tags', tags)
        form.append('coverImage', coverFile)
        form.append('bookPdf', pdfFile)
        const res = await fetch('/api/author/books', { method: 'POST', body: form })
        if (res.ok) { router.push('/author/dashboard') }
        else { const data = await res.json(); setError(data.error ?? 'Upload failed. Try again.'); setLoading(false) }
    }

    const fieldClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#999] focus:outline-none focus:border-[#C4956A] focus:ring-1 focus:ring-[#C4956A]/30 transition"
    const labelClass = "block text-[#444] text-sm font-medium mb-1.5"

    return (
        <>
            <AuthorNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link href="/author/dashboard" className="text-[#666666] hover:text-[#C4956A] text-sm font-medium transition-colors flex items-center gap-1.5 w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-[#222222] mb-1">Upload New Book</h1>
                    <p className="text-[#666666] text-sm mb-8">Your book will be reviewed by an admin before going live.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClass}>Title *</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" className={fieldClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Description *</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Write a compelling description…" rows={4}
                                    className={`${fieldClass} resize-none`} />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Category *</label>
                                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={fieldClass}>
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Language *</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)} className={fieldClass}>
                                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Tags <span className="text-[#999]">(comma-separated, optional)</span></label>
                                <input value={tags} onChange={e => setTags(e.target.value)} placeholder="fiction, thriller, mystery" className={fieldClass} />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Cover Image * <span className="text-[#999]">(max 5MB)</span></label>
                                    <input ref={coverRef} type="file" accept="image/*"
                                        className="w-full text-sm text-[#666] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-[#C4956A] file:font-semibold hover:file:bg-amber-100 cursor-pointer" />
                                </div>
                                <div>
                                    <label className={labelClass}>Book PDF * <span className="text-[#999]">(max 50MB)</span></label>
                                    <input ref={pdfRef} type="file" accept=".pdf"
                                        className="w-full text-sm text-[#666] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-[#C4956A] file:font-semibold hover:file:bg-amber-100 cursor-pointer" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-[#C4956A] hover:bg-[#b5835a] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-sm">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading…
                                        </span>
                                    ) : 'Upload Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
