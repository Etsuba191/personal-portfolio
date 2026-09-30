import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
)

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export const uploadReviewPhoto = async (file: Express.Multer.File) => {
  if (!configured) {
    throw new Error('Review photo storage is not configured.')
  }

  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio/reviews',
        resource_type: 'image',
        transformation: [{ width: 320, height: 320, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Review photo upload failed.'))
          return
        }
        resolve(result.secure_url)
      },
    )

    upload.end(file.buffer)
  })
}

export const uploadProjectImage = async (file: Express.Multer.File) => {
  if (!configured) throw new Error('Project image storage is not configured.')

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'portfolio/projects', resource_type: 'image', transformation: [{ width: 1800, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error('Project image upload failed.'))
          return
        }
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    upload.end(file.buffer)
  })
}

export const deleteProjectImageAsset = async (publicId: string) => {
  if (!configured) return
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

export const deleteCertificateAsset = async (publicId: string, resourceType: 'image' | 'raw') => {
  if (!configured) return
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export const uploadCvDocument = async (file: Express.Multer.File) => {
  if (!configured) throw new Error('CV storage is not configured.')
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder: 'portfolio/cv', resource_type: 'raw' }, (error, result) => {
      if (error || !result?.secure_url || !result.public_id) reject(error ?? new Error('CV upload failed.'))
      else resolve({ url: result.secure_url, publicId: result.public_id })
    })
    upload.end(file.buffer)
  })
}

export const uploadCertificateFile = async (file: Express.Multer.File) => {
  if (!configured) throw new Error('Certificate storage is not configured.')
  const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image'
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder: 'portfolio/certificates', resource_type: resourceType }, (error, result) => {
      if (error || !result?.secure_url || !result.public_id) reject(error ?? new Error('Certificate upload failed.'))
      else resolve({ url: result.secure_url, publicId: result.public_id })
    })
    upload.end(file.buffer)
  })
}

export const uploadAudioFile = async (file: Express.Multer.File) => {
  if (!configured) throw new Error('Audio storage is not configured.')
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Unsupported audio format. Use MP3, WAV, OGG, or WebM.')
  }
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'portfolio/audio', resource_type: 'video' },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error('Audio upload failed.'))
          return
        }
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    upload.end(file.buffer)
  })
}

export const deleteAudioAsset = async (publicId: string) => {
  if (!configured) return
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}
