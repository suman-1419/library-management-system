import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import Review from '@/models/Review'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { id } = await params
        const { rating, comment } = await req.json() as { rating?: number; comment?: string }

        const review = await Review.findOne({ _id: id, user: dbUser._id })
        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
            }
            review.rating = rating
        }
        if (comment !== undefined) review.comment = comment
        await review.save()

        // Recalculate averageRating and totalReviews
        const allReviews = await Review.find({ book: review.book })
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await Book.findByIdAndUpdate(review.book, {
            averageRating: Math.round(avg * 10) / 10,
            totalReviews: allReviews.length,
        })

        return NextResponse.json({ review })
    } catch {
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }
}
