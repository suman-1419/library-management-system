import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBorrowRecord extends Document {
    book: Types.ObjectId
    user: Types.ObjectId
    type: 'read' | 'download'
    pageProgress: number
    completedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const BorrowRecordSchema = new Schema<IBorrowRecord>(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['read', 'download'], required: true },
        pageProgress: { type: Number, default: 0 },
        completedAt: { type: Date },
    },
    { timestamps: true }
)

BorrowRecordSchema.index({ user: 1, type: 1 })
BorrowRecordSchema.index({ book: 1, type: 1 })

export default mongoose.models.BorrowRecord || mongoose.model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema)
