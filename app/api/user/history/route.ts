import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import BorrowRecord from '@/models/BorrowRecord'

export async function GET() {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const borrowRecords = await BorrowRecord.find({ user: dbUser._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'book',
                select: 'title coverImageUrl author',
                populate: { path: 'author', select: 'name' },
            })

        return NextResponse.json({ borrowRecords })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
