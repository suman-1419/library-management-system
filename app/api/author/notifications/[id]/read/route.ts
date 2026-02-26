import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Notification from '@/models/Notification'

export async function PATCH(
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
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: dbUser._id },
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json({ notification })
    } catch {
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
    }
}
