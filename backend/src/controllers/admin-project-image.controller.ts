import type { Request, Response } from 'express'
import { addProjectImage, deleteProjectImage, findProjectImage, reorderProjectImages } from '../repositories/project.repository'
import { deleteProjectImageAsset, uploadProjectImage } from '../services/review-image.service'

const idOf = (value: unknown) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null

export const uploadAdminProjectImage = async (req: Request, res: Response) => {
  const projectId = idOf(req.params.id)
  if (!projectId || !req.file) {
    res.status(400).json({ success: false, message: 'A project and image are required.' })
    return
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
    res.status(400).json({ success: false, message: 'Project images must be JPG, PNG, or WebP files.' })
    return
  }
  try {
    const uploaded = await uploadProjectImage(req.file)
    const image = await addProjectImage(projectId, uploaded.url, uploaded.publicId, typeof req.body.alt === 'string' ? req.body.alt.trim().slice(0, 160) || null : null)
    res.status(201).json({ success: true, data: image })
  } catch (error) {
    console.error('Project image upload failed', error)
    res.status(503).json({ success: false, message: 'Project image could not be uploaded.' })
  }
}

export const removeAdminProjectImage = async (req: Request, res: Response) => {
  const projectId = idOf(req.params.id)
  const imageId = idOf(req.params.imageId)
  if (!projectId || !imageId) {
    res.status(400).json({ success: false, message: 'Invalid project image.' })
    return
  }
  try {
    const image = await findProjectImage(projectId, imageId)
    if (!image || !await deleteProjectImage(projectId, imageId)) {
      res.status(404).json({ success: false, message: 'Project image not found.' })
      return
    }
    if (image.cloudinaryId) await deleteProjectImageAsset(String(image.cloudinaryId))
    res.status(204).send()
  } catch (error) {
    console.error('Project image deletion failed', error)
    res.status(503).json({ success: false, message: 'Project image could not be deleted.' })
  }
}

export const reorderAdminProjectImages = async (req: Request, res: Response) => {
  const projectId = idOf(req.params.id)
  const imageIds = Array.isArray(req.body.imageIds) ? req.body.imageIds.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!projectId || imageIds.length === 0) {
    res.status(400).json({ success: false, message: 'Provide an ordered list of image ids.' })
    return
  }
  try {
    await reorderProjectImages(projectId, imageIds)
    res.json({ success: true })
  } catch (error) {
    console.error('Project image reorder failed', error)
    res.status(503).json({ success: false, message: 'Project images could not be reordered.' })
  }
}