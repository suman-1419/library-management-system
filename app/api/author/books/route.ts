import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import { uploadToCloudinary } from '@/lib/cloudinary'

// GET — all books by this author
export async function GET() {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const books = await Book.find({ author: dbUser._id })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })

        return NextResponse.json({ books })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }
}

// POST — upload a new book
export async function POST(req: Request) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const formData = await req.formData()
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const categoryId = formData.get('categoryId') as string
        const language = formData.get('language') as string
        const tags = formData.get('tags') as string
        const coverFile = formData.get('coverImage') as File | null
        const pdfFile = formData.get('bookPdf') as File | null

        if (!title || !description || !categoryId || !language || !coverFile || !pdfFile) {
            return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
        }

        if (coverFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Cover image must be ≤ 5MB' }, { status: 400 })
        }
        if (pdfFile.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'PDF must be ≤ 50MB' }, { status: 400 })
        }

        const [coverBuffer, pdfBuffer] = await Promise.all([
            coverFile.arrayBuffer().then(Buffer.from),
            pdfFile.arrayBuffer().then(Buffer.from),
        ])

        const [cover, pdf] = await Promise.all([
            uploadToCloudinary(coverBuffer, { folder: 'lms/covers', resource_type: 'image' }),
            uploadToCloudinary(pdfBuffer, { folder: 'lms/books', resource_type: 'raw' }),
        ])

        const parsedTags = tags
            ? tags.split(',').map(t => t.trim()).filter(Boolean)
            : []

        const book = await Book.create({
            title,
            description,
            author: dbUser._id,
            category: categoryId,
            language,
            tags: parsedTags,
            coverImageUrl: cover.url,
            coverImagePublicId: cover.public_id,
            pdfUrl: pdf.url,
            pdfPublicId: pdf.public_id,
            isApproved: false,
            isPublished: false,
        })

        return NextResponse.json({ book }, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to upload book' }, { status: 500 })
    }
}
