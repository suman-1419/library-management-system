import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// ─── Upload ───────────────────────────────────────────────────────────────────

interface UploadOptions {
    folder: string
    resource_type: 'image' | 'raw'
    public_id?: string
}

interface UploadResult {
    url: string
    public_id: string
}

export function uploadToCloudinary(
    file: Buffer,
    options: UploadOptions
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder,
                resource_type: options.resource_type,
                public_id: options.public_id,
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error ?? new Error('Cloudinary upload returned no result'))
                }
                resolve({ url: result.secure_url, public_id: result.public_id })
            }
        )
        stream.end(file)
    })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFromCloudinary(
    public_id: string,
    resource_type: 'image' | 'raw'
): Promise<void> {
    await cloudinary.uploader.destroy(public_id, { resource_type })
}
