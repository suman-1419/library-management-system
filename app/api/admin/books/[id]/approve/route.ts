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
            { isApproved: true, isPublished: true },
            { new: true }
        ) as IBook | null

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 })
        }

        await Notification.create({
            recipient: book.author,
            type: 'book_approved',
            message: `Your book "${book.title}" has been approved and is now live!`,
            relatedBook: book._id,
        })

        return NextResponse.json({ book })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to approve book' },
            { status: 500 }
        )
    }
}
