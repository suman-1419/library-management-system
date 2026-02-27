'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import UserNav from '@/components/shared/UserNav'

interface Author { name: string }
interface Category { name: string; slug: string }

interface Book {
    _id: string
    title: string
    description: string
    coverImageUrl: string
    language: string
    tags: string[]
    averageRating: number
    totalReviews: number
    author: Author
    category: Category
}

interface Review {
    _id: string
    rating: number
    comment: string
    user: { name: string }
    createdAt: string
}

function StarRow({ rating }: { rating: number }) {
    return (
        <span className="text-amber-400">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </span>
    )
}

export default function BookDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [book, setBook] = useState<Book | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [hasBorrowed, setHasBorrowed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [actionMsg, setActionMsg] = useState('')

    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [reviewErr, setReviewErr] = useState('')

    const fetchAll = async () => {
        const [bookRes, histRes] = await Promise.all([
            fetch(`/api/user/books/${id}`).then(r => r.json()),
            fetch('/api/user/history').then(r => r.json()),
        ])
        setBook(bookRes.book ?? null)
        setReviews(bookRes.reviews ?? [])
        const borrowed = (histRes.borrowRecords ?? []).some(
            (r: { book: { _id: string } }) => r.book?._id === id
        )
        setHasBorrowed(borrowed)
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [id])

    const handleRead = async () => {
        await fetch(`/api/user/read/${id}`, { method: 'POST' })
        router.push(`/user/read/${id}`)
    }

    const handleDownload = async () => {
        setActionMsg('Preparing download…')
        const res = await fetch(`/api/user/download/${id}`, { method: 'POST' })
        const data = await res.json()
        if (data.pdfUrl) { window.open(data.pdfUrl, '_blank'); setHasBorrowed(true) }
        setActionMsg('')
    }

    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault()
        setReviewErr('')
        setSubmitting(true)
        const res = await fetch('/api/user/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: id, rating, comment }),
        })
        if (res.ok) { setComment(''); setRating(5); fetchAll() }
        else { const data = await res.json(); setReviewErr(data.error ?? 'Failed to submit review') }
        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!book) {
        return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#666666]">Book not found.</div>
    }

    return (
        <>
            <UserNav />
            <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <button onClick={() => router.back()} className="text-[#666666] hover:text-[#C4956A] text-sm font-medium transition-colors flex items-center gap-1.5 w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back
                        </button>
                    </div>

                    {/* Book Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="relative w-40 h-56 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-[#222222] mb-1">{book.title}</h1>
                                <p className="text-[#666666] mb-1">by <span className="text-[#222222] font-medium">{book.author?.name}</span></p>
                                <p className="text-sm text-[#666666] mb-2">
                                    <span className="bg-amber-50 text-[#C4956A] px-2 py-0.5 rounded-full text-xs font-semibold mr-2">{book.category?.name}</span>
                                    <span>{book.language}</span>
                                </p>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-amber-400">{'★'.repeat(Math.round(book.averageRating))}{'☆'.repeat(5 - Math.round(book.averageRating))}</span>
                                    <span className="text-[#666666] text-sm">{book.averageRating.toFixed(1)} ({book.totalReviews} reviews)</span>
                                </div>
                                {book.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-5">
                                        {book.tags.map(t => (
                                            <span key={t} className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-[#666666]">#{t}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-3 flex-wrap">
                                    <button onClick={handleRead}
                                        className="px-6 py-2.5 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                                        Read Online
                                    </button>
                                    <button onClick={handleDownload} disabled={!!actionMsg}
                                        className="px-6 py-2.5 border border-[#C4956A] text-[#C4956A] hover:bg-[#C4956A] hover:text-white disabled:opacity-60 font-semibold rounded-xl text-sm transition-colors">
                                        {actionMsg || 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-base font-bold text-[#222222] mb-3">About this book</h2>
                        <p className="text-[#666666] leading-relaxed">{book.description}</p>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-base font-bold text-[#222222] mb-4">Reviews ({reviews.length})</h2>
                        {reviews.length === 0 ? (
                            <p className="text-[#666666] text-sm">No reviews yet. Be the first!</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(r => (
                                    <div key={r._id} className="border border-gray-100 rounded-xl px-5 py-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-[#222222]">{r.user?.name}</span>
                                            <span className="text-xs text-[#999]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <StarRow rating={r.rating} />
                                        {r.comment && <p className="text-[#666666] text-sm mt-2">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Write a Review */}
                    {hasBorrowed && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-bold text-[#222222] mb-4">Write a Review</h2>
                            {reviewErr && <p className="text-red-500 text-sm mb-3">{reviewErr}</p>}
                            <form onSubmit={handleReview} className="space-y-4">
                                <div>
                                    <label className="block text-[#444] text-sm mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setRating(s)}
                                                className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? 'text-amber-400' : 'text-gray-300'}`}>
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[#444] text-sm mb-1">Comment (optional)</label>
                                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                                        placeholder="Share your thoughts…"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#999] focus:outline-none focus:border-[#C4956A] focus:ring-1 focus:ring-[#C4956A]/30 resize-none transition" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2.5 bg-[#C4956A] hover:bg-[#b5835a] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                                    {submitting ? 'Submitting…' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
