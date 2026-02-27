'use client'
import dynamic from 'next/dynamic'

const PDFReader = dynamic(() => import('@/components/PDFReader'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#666666]">
            Loading PDF viewer…
        </div>
    ),
})

export default function ReadPage() {
    return <PDFReader />
}
