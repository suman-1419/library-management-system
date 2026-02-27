import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import Review from '@/models/Review'
import BorrowRecord from '@/models/BorrowRecord'
import Notification from '@/models/Notification'
import { IBook } from '@/models/Book'

export async function POST(req: NextRequest) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { bookId, rating, comment } = await req.json() as {
            bookId: string
            rating: number
            comment: string
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        // Must have a BorrowRecord for this book
        const hasBorrowed = await BorrowRecord.exists({ book: bookId, user: dbUser._id })
        if (!hasBorrowed) {
            return NextResponse.json(
                { error: 'You must read or download this book before reviewing' },
                { status: 400 }
            )
        }

        const book = await Book.findById(bookId) as IBook | null
        if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

        const review = await Review.create({
            book: bookId,
            user: dbUser._id,
            rating,
            comment,
        })

        // Recalculate averageRating and totalReviews
        const allReviews = await Review.find({ book: bookId })
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await Book.findByIdAndUpdate(bookId, {
            averageRating: Math.round(avg * 10) / 10,
            totalReviews: allReviews.length,
        })

        // Notify the book's author
        await Notification.create({
            recipient: book.author,
            type: 'new_review',
            message: `${dbUser.name} left a ${rating}★ review on "${book.title}"`,
            relatedBook: bookId,
        })

        return NextResponse.json({ review }, { status: 201 })
    } catch (err: unknown) {
        // Duplicate review (unique index violation)
        if (err instanceof Error && err.message.includes('duplicate key')) {
            return NextResponse.json({ error: 'You have already reviewed this book' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
