import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()

    // Only allow user or author — admin is set manually
    if (!['user', 'author'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const client = await clerkClient()

    // Check if role already exists — never overwrite!
    const clerkUser = await client.users.getUser(userId)
    if (clerkUser.publicMetadata?.role) {
        return NextResponse.json({ error: 'Role already set' }, { status: 400 })
    }

    // Save role to Clerk metadata permanently
    await client.users.updateUserMetadata(userId, {
        publicMetadata: { role },
    })

    // Save user to MongoDB
    await dbConnect()
    await User.findOneAndUpdate(
        { clerkId: userId },
        {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
            profileImage: clerkUser.imageUrl,
            role,
        },
        { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, role })
}