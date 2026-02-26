import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import Review from '@/models/Review'
import BorrowRecord from '@/models/BorrowRecord'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'
import { IBook } from '@/models/Book'

type Params = { params: Promise<{ id: string }> }

// PATCH — update a book (requires re-approval)
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { id } = await params
        const existing = await Book.findOne({ _id: id, author: dbUser._id }) as IBook | null
        if (!existing) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

        const formData = await req.formData()
        const title = formData.get('title') as string | null
        const description = formData.get('description') as string | null
        const categoryId = formData.get('categoryId') as string | null
        const language = formData.get('language') as string | null
        const tags = formData.get('tags') as string | null
        const coverFile = formData.get('coverImage') as File | null
        const pdfFile = formData.get('bookPdf') as File | null

        const update: Record<string, unknown> = {
            isApproved: false,
            isPublished: false,
        }

        if (title) update.title = title
        if (description) update.description = description
        if (categoryId) update.category = categoryId
        if (language) update.language = language
        if (tags) update.tags = tags.split(',').map(t => t.trim()).filter(Boolean)

        if (coverFile && coverFile.size > 0) {
            if (coverFile.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: 'Cover image must be ≤ 5MB' }, { status: 400 })
            }
            await deleteFromCloudinary(existing.coverImagePublicId, 'image')
            const buf = Buffer.from(await coverFile.arrayBuffer())
            const result = await uploadToCloudinary(buf, { folder: 'lms/covers', resource_type: 'image' })
            update.coverImageUrl = result.url
            update.coverImagePublicId = result.public_id
        }

        if (pdfFile && pdfFile.size > 0) {
            if (pdfFile.size > 50 * 1024 * 1024) {
                return NextResponse.json({ error: 'PDF must be ≤ 50MB' }, { status: 400 })
            }
            await deleteFromCloudinary(existing.pdfPublicId, 'raw')
            const buf = Buffer.from(await pdfFile.arrayBuffer())
            const result = await uploadToCloudinary(buf, { folder: 'lms/books', resource_type: 'raw' })
            update.pdfUrl = result.url
            update.pdfPublicId = result.public_id
        }

        const book = await Book.findByIdAndUpdate(id, update, { new: true })
        return NextResponse.json({ book })
    } catch {
        return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
    }
}

// DELETE — remove book + Cloudinary assets + reviews + borrow records
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        await dbConnect()
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await User.findOne({ clerkId: userId })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { id } = await params
        const book = await Book.findOne({ _id: id, author: dbUser._id }) as IBook | null
        if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

        await Promise.all([
            deleteFromCloudinary(book.coverImagePublicId, 'image'),
            deleteFromCloudinary(book.pdfPublicId, 'raw'),
            Review.deleteMany({ book: book._id }),
            BorrowRecord.deleteMany({ book: book._id }),
        ])

        await Book.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
    }
}
