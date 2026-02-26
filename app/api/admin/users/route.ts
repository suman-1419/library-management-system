import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const role = req.nextUrl.searchParams.get('role') ?? 'all'

        const filter: Record<string, string> = {}
        if (role !== 'all') filter.role = role

        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .select('name email role isActive createdAt')

        return NextResponse.json({ users })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
