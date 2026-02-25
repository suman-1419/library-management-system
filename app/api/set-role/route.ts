import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export async function POST(req: Request) {
    console.log('[SET-ROLE] Request received')
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()
    console.log('[SET-ROLE] Role from request body:', role)

    // Only allow user or author — admin is set manually
    if (!['user', 'author'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const client = await clerkClient()

    // Check if role already exists — never overwrite!
    const clerkUser = await client.users.getUser(userId)
    console.log('[SET-ROLE] Clerk user publicMetadata:', clerkUser.publicMetadata)
    const existingRole = clerkUser.publicMetadata?.role as string | undefined
    if (existingRole) {
        console.log('[SET-ROLE] Role already exists:', existingRole, '— returning early')
        return NextResponse.json({ message: 'Role already set', role: existingRole })
    }

    // Save role to Clerk metadata permanently
    await client.users.updateUserMetadata(userId, {
        publicMetadata: { role },
    })
    console.log('[SET-ROLE] Role saved to Clerk successfully:', role)

    // Save user to MongoDB
    await dbConnect()
    try {
        await User.findOneAndUpdate(
            { clerkId: userId },
            {
                clerkId: userId,
                email: clerkUser.emailAddresses[0]?.emailAddress,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
                profileImage: clerkUser.imageUrl,
                role,
            },
            { upsert: true, returnDocument: 'after' }
        )
    } catch (dbError: any) {
        // Ignore duplicate key error — user already exists in DB
        if (dbError.code !== 11000) {
            throw dbError
        }
    }
    console.log('[SET-ROLE] Role saved to MongoDB successfully')

    console.log('[SET-ROLE] Sending response with role:', role)
    return NextResponse.json({ success: true, role })
}