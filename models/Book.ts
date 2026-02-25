import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBook extends Document {
    title: string
    description: string
    author: Types.ObjectId
    category: Types.ObjectId
    coverImageUrl: string
    coverImagePublicId: string
    pdfUrl: string
    pdfPublicId: string
    isApproved: boolean
    isPublished: boolean
    averageRating: number
    totalReviews: number
    totalReads: number
    totalDownloads: number
    createdAt: Date
    updatedAt: Date
}

const BookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        coverImageUrl: { type: String, required: true },
        coverImagePublicId: { type: String, required: true },
        pdfUrl: { type: String, required: true },
        pdfPublicId: { type: String, required: true },
        isApproved: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: false },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        totalReads: { type: Number, default: 0 },
        totalDownloads: { type: Number, default: 0 },
    },
    { timestamps: true }
)

BookSchema.index({ author: 1 })
BookSchema.index({ category: 1, isApproved: 1, isPublished: 1 })

export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema)
