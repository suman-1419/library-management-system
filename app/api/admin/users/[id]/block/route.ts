import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()

        const user = await User.findByIdAndUpdate(
            params.id,
            { isActive: false },
            { new: true }
        )

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to block user' },
            { status: 500 }
        )
    }
}
