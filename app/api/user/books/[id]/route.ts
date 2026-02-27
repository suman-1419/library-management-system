import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Book from '@/models/Book'
import Review from '@/models/Review'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const book = await Book.findOne({ _id: id, isApproved: true, isPublished: true })
            .populate('author', 'name')
            .populate('category', 'name slug')

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 })
        }

        const reviews = await Review.find({ book: id })
            .populate('user', 'name')
            .sort({ createdAt: -1 })

        return NextResponse.json({ book, reviews })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
    }
}
