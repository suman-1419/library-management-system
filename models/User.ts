import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
    clerkId: string
    email: string
    name: string
    profileImage: string
    role: 'admin' | 'author' | 'user'
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profileImage: { type: String, default: '' },
    role: {
        type: String,
        enum: ['admin', 'author', 'user'],
        required: true,
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
