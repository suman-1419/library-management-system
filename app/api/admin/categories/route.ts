import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'
import Book from '@/models/Book'
import { Types } from 'mongoose'

// GET all categories
export async function GET() {
    try {
        await dbConnect()
        const categories = await Category.find().sort({ name: 1 })
        return NextResponse.json({ categories })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

// POST create category
export async function POST(req: Request) {
    try {
        await dbConnect()

        const { name, description } = await req.json()

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const slug = name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')

        const category = await Category.create({ name, slug, description })

        return NextResponse.json({ category }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
