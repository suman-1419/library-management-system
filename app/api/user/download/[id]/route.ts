import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import BorrowRecord from '@/models/BorrowRecord'
import { IBook } from '@/models/Book'

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { id } = await params

        const book = await Book.findById(id) as IBook | null
        if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

        const before = await BorrowRecord.findOne({ book: id, user: dbUser._id, type: 'download' })

        const borrowRecord = await BorrowRecord.findOneAndUpdate(
            { book: id, user: dbUser._id, type: 'download' },
            { $setOnInsert: { book: id, user: dbUser._id, type: 'download' } },
            { upsert: true, new: true }
        )

        if (!before) {
            await Book.findByIdAndUpdate(id, { $inc: { totalDownloads: 1 } })
        }

        return NextResponse.json({ success: true, pdfUrl: book.pdfUrl })
    } catch {
        return NextResponse.json({ error: 'Failed to record download' }, { status: 500 })
    }
}
