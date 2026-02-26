import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Book from '@/models/Book'
import Notification from '@/models/Notification'
import { IBook } from '@/models/Book'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const book = await Book.findByIdAndUpdate(
            id,
            { isApproved: false, isPublished: false },
            { new: true }
        ) as IBook | null

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 })
        }

        await Notification.create({
            recipient: book.author,
            type: 'book_rejected',
            message: `Your book "${book.title}" has been rejected. You can edit and resubmit.`,
            relatedBook: book._id,
        })

        return NextResponse.json({ book })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to reject book' },
            { status: 500 }
        )
    }
}
