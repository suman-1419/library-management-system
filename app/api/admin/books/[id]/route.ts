import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Book from '@/models/Book'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { IBook } from '@/models/Book'

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const book = await Book.findById(id) as IBook | null

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 })
        }

        // Delete assets from Cloudinary
        await Promise.all([
            deleteFromCloudinary(book.coverImagePublicId, 'image'),
            deleteFromCloudinary(book.pdfPublicId, 'raw'),
        ])

        await Book.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete book' },
            { status: 500 }
        )
    }
}
