import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import BorrowRecord from '@/models/BorrowRecord'

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

        // upsert — only create if not exists
        const before = await BorrowRecord.findOne({ book: id, user: dbUser._id, type: 'read' })

        const borrowRecord = await BorrowRecord.findOneAndUpdate(
            { book: id, user: dbUser._id, type: 'read' },
            { $setOnInsert: { book: id, user: dbUser._id, type: 'read' } },
            { upsert: true, new: true }
        )

        // Only increment totalReads if this was a brand-new record
        if (!before) {
            await Book.findByIdAndUpdate(id, { $inc: { totalReads: 1 } })
        }

        return NextResponse.json({ success: true, borrowRecord })
    } catch {
        return NextResponse.json({ error: 'Failed to record read' }, { status: 500 })
    }
}
