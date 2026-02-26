import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import Review from '@/models/Review'
import { Types } from 'mongoose'

export async function GET() {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const books = await Book.find({ author: dbUser._id }).select(
            'title totalReads totalDownloads averageRating totalReviews'
        )

        const bookIds = books.map(b => b._id as Types.ObjectId)

        // Star breakdown across all author's books
        const starAgg = await Review.aggregate([
            { $match: { book: { $in: bookIds } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
        ])

        const starBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        for (const { _id, count } of starAgg) {
            starBreakdown[_id as number] = count
        }

        const totalReads = books.reduce((s, b) => s + b.totalReads, 0)
        const totalDownloads = books.reduce((s, b) => s + b.totalDownloads, 0)

        return NextResponse.json({ books, totalReads, totalDownloads, starBreakdown })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
