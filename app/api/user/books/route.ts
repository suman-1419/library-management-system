import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Book from '@/models/Book'

export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = req.nextUrl
        const search = searchParams.get('search') ?? ''
        const category = searchParams.get('category') ?? ''
        const language = searchParams.get('language') ?? ''
        const sort = searchParams.get('sort') ?? 'newest'

        const filter: Record<string, unknown> = {
            isApproved: true,
            isPublished: true,
        }

        if (search) {
            const regex = new RegExp(search, 'i')
            filter.$or = [
                { title: regex },
                { description: regex },
                { tags: regex },
            ]
        }

        if (category) filter.category = category
        if (language) filter.language = language

        const sortMap: Record<string, Record<string, 1 | -1>> = {
            newest: { createdAt: -1 },
            mostDownloaded: { totalDownloads: -1 },
            highestRated: { averageRating: -1 },
        }

        const books = await Book.find(filter)
            .sort(sortMap[sort] ?? sortMap.newest)
            .populate('author', 'name')
            .populate('category', 'name slug')

        return NextResponse.json({ books })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }
}
