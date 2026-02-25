import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IReview extends Document {
    book: Types.ObjectId
    user: Types.ObjectId
    rating: number
    comment: string
    createdAt: Date
    updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true },
    },
    { timestamps: true }
)

// One review per user per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
