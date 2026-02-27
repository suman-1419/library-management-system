'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import UserNav from '@/components/shared/UserNav'

interface Category { _id: string; name: string }

interface BookCard {
    _id: string
    title: string
    coverImageUrl: string
    author: { name: string }
    category: { _id: string; name: string }
    averageRating: number
    totalDownloads: number
    language: string
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'mostDownloaded', label: 'Most Downloaded' },
    { value: 'highestRated', label: 'Highest Rated' },
]

const LANGUAGES = ['', 'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Other']

export default function BrowsePage() {
    const [books, setBooks] = useState<BookCard[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [language, setLanguage] = useState('')
    const [sort, setSort] = useState('newest')
    const [query, setQuery] = useState('')

    useEffect(() => {
        const t = setTimeout(() => setQuery(search), 300)
        return () => clearTimeout(t)
    }, [search])

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (query) params.set('search', query)
        if (category) params.set('category', category)
        if (language) params.set('language', language)
        params.set('sort', sort)
        const res = await fetch(`/api/user/books?${params}`)
        const data = await res.json()
        setBooks(data.books ?? [])
        setLoading(false)
    }, [query, category, language, sort])

    useEffect(() => { fetchBooks() }, [fetchBooks])

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(r => r.json())
            .then(d => setCategories(d.categories ?? []))
    }, [])

    const selectClass = "bg-white border border-gray-200 text-[#444] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C4956A] focus:ring-1 focus:ring-[#C4956A]/30 transition cursor-pointer"

    return (
        <>
            <UserNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">Browse Books</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title, author, or ISBN…"
                            className="w-full max-w-md bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222222] placeholder:text-[#999] focus:outline-none focus:border-[#C4956A] focus:ring-1 focus:ring-[#C4956A]/30 transition"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="flex items-center gap-3 mb-8 flex-wrap">
                        <span className="text-sm text-[#666666] font-medium">Filter by:</span>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
                            {LANGUAGES.map(l => <option key={l} value={l}>{l || 'All Languages'}</option>)}
                        </select>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-[#666666]">Sort:</span>
                            <select value={sort} onChange={e => setSort(e.target.value)} className={selectClass}>
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Books Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : books.length === 0 ? (
                        <p className="text-center text-[#666666] py-20">No books found. Try a different search.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {books.map(book => (
                                <Link key={book._id} href={`/user/books/${book._id}`}>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                                        <div className="relative">
                                            <div className="relative w-full h-56 bg-gray-100">
                                                <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
                                            </div>
                                            <span className="absolute top-3 left-3 bg-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm text-[#C4956A]">
                                                {book.category?.name}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[#222222] truncate text-sm">{book.title}</h3>
                                            <p className="text-sm text-[#666666] mt-1 truncate">{book.author?.name}</p>
                                            <div className="flex items-center justify-between mt-3 text-xs text-[#666666]">
                                                <span className="text-amber-500 font-semibold">★ {book.averageRating.toFixed(1)}</span>
                                                <span>{(book.totalDownloads / 1000).toFixed(1)}k downloads</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
