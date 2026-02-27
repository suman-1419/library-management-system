import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

export default function PDFReader() {
    const { id } = useParams<{ id: string }>()

    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [numPages, setNumPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [scale, setScale] = useState(1.2)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([
            fetch(`/api/user/books/${id}`).then(r => r.json()),
            fetch(`/api/user/read/${id}`, { method: 'POST' }),
        ]).then(([bookData]) => {
            if (bookData.book?.pdfUrl) {
                setPdfUrl(bookData.book.pdfUrl)
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
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !pdfUrl) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
                {error || 'No PDF available.'}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg text-sm font-semibold transition-colors"
                    >
                        ← Prev
                    </button>
                    <span className="text-sm text-slate-300 whitespace-nowrap">
                        Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                        <span className="text-white font-semibold">{numPages}</span>
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={currentPage >= numPages}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Next →
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(s => Math.min(2.5, parseFloat((s + 0.2).toFixed(1))))}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Zoom In +
                    </button>
                    <span className="text-slate-400 text-xs">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.max(0.6, parseFloat((s - 0.2).toFixed(1))))}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Zoom Out −
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto flex justify-center py-8 px-4">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    onLoadError={() => setError('Failed to load PDF.')}
                    loading={
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderAnnotationLayer
                        renderTextLayer
                    />
                </Document>
            </div>
        </div>
    )
}
