import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Book from '@/models/Book'

export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const status = req.nextUrl.searchParams.get('status') ?? 'all'

        const filter: Record<string, boolean> = {}
        if (status === 'pending') filter.isApproved = false
        if (status === 'approved') filter.isApproved = true

        const books = await Book.find(filter)
            .sort({ createdAt: -1 })
            .populate('author', 'name email')
            .populate('category', 'name')

        return NextResponse.json({ books })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch books' },
            { status: 500 }
        )
    }
}
