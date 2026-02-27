import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import BorrowRecord from '@/models/BorrowRecord'

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
        const { currentPage, totalPages } = await req.json() as {
            currentPage: number
            totalPages: number
        }

        const update: Record<string, unknown> = { pageProgress: currentPage }
        if (currentPage >= totalPages) {
            update.completedAt = new Date()
        }

        const borrowRecord = await BorrowRecord.findOneAndUpdate(
            { book: id, user: dbUser._id, type: 'read' },
            update,
            { new: true }
        )

        return NextResponse.json({ borrowRecord })
    } catch {
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }
}
