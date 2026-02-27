'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

export default function PDFReader() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [bookTitle, setBookTitle] = useState('')
    const [numPages, setNumPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [scale, setScale] = useState(1.0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([
            fetch(`/api/user/books/${id}`).then(r => r.json()),
            fetch(`/api/user/read/${id}`, { method: 'POST' }),
        ]).then(([bookData]) => {
            if (bookData.book?.pdfUrl) {
                setPdfUrl(bookData.book.pdfUrl)
                setBookTitle(bookData.book.title ?? '')
            } else {
                setError('Could not load PDF.')
            }
            setLoading(false)
        }).catch(() => {
            setError('Failed to load book.')
            setLoading(false)
        })
    }, [id])

    const saveProgress = useCallback(async (page: number, total: number) => {
        await fetch(`/api/user/read/${id}/progress`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPage: page, totalPages: total }),
        })
    }, [id])

    const changePage = (delta: number) => {
        const next = Math.min(Math.max(1, currentPage + delta), numPages)
        setCurrentPage(next)
        saveProgress(next, numPages)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !pdfUrl) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-4">
                <p className="text-[#666666]">{error || 'No PDF available.'}</p>
                <button onClick={() => router.back()} className="text-[#C4956A] hover:underline text-sm font-medium">← Go Back</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-[#16213e] border-b border-white/10 px-3 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Left: Back + title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => router.push(`/user/books/${id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        {bookTitle && (
                            <span className="text-sm text-white/70 truncate max-w-[120px] sm:max-w-[250px]">{bookTitle}</span>
                        )}
                    </div>

                    {/* Center: Page navigation */}
                    <div className="flex items-center gap-2 order-last sm:order-none w-full sm:w-auto justify-center sm:justify-start">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-sm font-semibold transition-colors"
                        >
                            ← Prev
                        </button>
                        <span className="text-sm text-white/70 whitespace-nowrap">
                            <span className="text-white font-semibold">{currentPage}</span>
                            {' / '}
                            <span className="text-white font-semibold">{numPages}</span>
                        </span>
                        <button
                            onClick={() => changePage(1)}
                            disabled={currentPage >= numPages}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Next →
                        </button>
                    </div>

                    {/* Right: Zoom */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, parseFloat((s - 0.2).toFixed(1))))}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                            title="Zoom out"
                        >−</button>
                        <span className="text-xs text-white/60 w-9 text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(s => Math.min(2.5, parseFloat((s + 0.2).toFixed(1))))}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                            title="Zoom in"
                        >+</button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto flex justify-center py-6 px-2 sm:px-4">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    onLoadError={() => setError('Failed to load PDF.')}
                    loading={
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderAnnotationLayer
                        renderTextLayer
                        className="shadow-2xl"
                    />
                </Document>
            </div>
        </div>
    )
}
