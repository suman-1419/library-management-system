import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'

// PATCH update category
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()

        const { name, description } = await req.json()

        const update: { name?: string; slug?: string; description?: string } = {}

        if (name) {
            update.name = name
            update.slug = name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
        }

        if (description !== undefined) update.description = description

        const category = await Category.findByIdAndUpdate(params.id, update, {
            new: true,
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ category })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

// DELETE category
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()

        const { default: Book } = await import('@/models/Book')

        const booksInCategory = await Book.countDocuments({ category: params.id })
        if (booksInCategory > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with books assigned' },
                { status: 400 }
            )
        }

        await Category.findByIdAndDelete(params.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
