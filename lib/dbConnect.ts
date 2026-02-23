import mongoose from 'mongoose'

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

export default mongoose.models.User || mongoose.model('User', UserSchema)