import mongoose, { Document, Schema, Types } from 'mongoose'

export interface INotification extends Document {
    recipient: Types.ObjectId
    type: 'book_approved' | 'book_rejected' | 'new_review'
    message: string
    relatedBook?: Types.ObjectId
    isRead: boolean
    createdAt: Date
    updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['book_approved', 'book_rejected', 'new_review'], required: true },
        message: { type: String, required: true },
        relatedBook: { type: Schema.Types.ObjectId, ref: 'Book' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
)

// Fast unread count queries per user
NotificationSchema.index({ recipient: 1, isRead: 1 })

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
