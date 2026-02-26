import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'

export async function GET() {
    try {
        await dbConnect()

        const [
            totalUsers,
            totalAuthors,
            totalReaders,
            totalBooks,
            pendingBooks,
            approvedBooks,
            mostReadBooks,
            mostDownloadedBooks,
            recentUsers,
            downloadAgg,
            readAgg,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'author' }),
            User.countDocuments({ role: 'user' }),
            Book.countDocuments(),
            Book.countDocuments({ isApproved: false }),
            Book.countDocuments({ isApproved: true }),
            Book.find()
                .sort({ totalReads: -1 })
                .limit(5)
                .populate('author', 'name')
                .select('title totalReads author'),
            Book.find()
                .sort({ totalDownloads: -1 })
                .limit(5)
                .populate('author', 'name')
                .select('title totalDownloads author'),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email role createdAt'),
            Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalDownloads' } } }]),
            Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalReads' } } }]),
        ])

        return NextResponse.json({
            totalUsers,
            totalAuthors,
            totalReaders,
            totalBooks,
            pendingBooks,
            approvedBooks,
            totalDownloads: downloadAgg[0]?.total ?? 0,
            totalReads: readAgg[0]?.total ?? 0,
            mostReadBooks,
            mostDownloadedBooks,
            recentUsers,
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
