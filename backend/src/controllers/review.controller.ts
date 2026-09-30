import type { Request, Response } from 'express'
import { createReview, deleteReview, findAllReviews, findApprovedReviews, updateReview, updateReviewStatus } from '../repositories/review.repository'
import { uploadReviewPhoto } from '../services/review-image.service'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const parseId = (value: unknown) => typeof value === 'string' && Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null

export const submitReview = async (req: Request, res: Response) => {
  const name = clean(req.body.name)
  const email = clean(req.body.email).toLowerCase()
  const role = clean(req.body.role)
  const company = clean(req.body.company)
  const comment = clean(req.body.comment)
  const rating = Number(req.body.rating)

  if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || email.length > 254 || role.length < 2 || role.length > 120 || company.length > 160 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 2000) {
    res.status(400).json({ success: false, message: 'Please provide valid review details.' })
    return
  }

  if (req.file && !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
    res.status(400).json({ success: false, message: 'Profile photo must be a JPG, PNG, or WebP image.' })
    return
  }

  try {
    const photoUrl = req.file ? await uploadReviewPhoto(req.file) : null
    const review = await createReview({ name, email, role, company, rating, comment, photo: req.file }, photoUrl)
    res.status(201).json({ success: true, data: { id: review.id } })
  } catch (error) {
    console.error('Review submission failed', error)
    res.status(503).json({ success: false, message: 'Your review could not be submitted right now. Please try again later.' })
  }
}

export const getPublicReviews = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await findApprovedReviews() })
  } catch (error) {
    console.error('Public reviews lookup failed', error)
    res.status(503).json({ success: false, message: 'Reviews are temporarily unavailable.' })
  }
}

export const getAdminReviews = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await findAllReviews() })
  } catch (error) {
    console.error('Admin reviews lookup failed', error)
    res.status(503).json({ success: false, message: 'Reviews are temporarily unavailable.' })
  }
}

export const updateAdminReview = async (req: Request, res: Response) => {
  const id = parseId(req.params.id)
  const body = req.body as Record<string, unknown>
  const name = clean(body.name)
  const email = clean(body.email).toLowerCase()
  const role = clean(body.role)
  const company = clean(body.company)
  const comment = clean(body.comment)
  const rating = Number(body.rating)
  const status = body.status === 'APPROVED' || body.status === 'REJECTED' || body.status === 'PENDING' ? body.status as 'PENDING' | 'APPROVED' | 'REJECTED' : null

  if (!id || name.length < 2 || name.length > 100 || !emailPattern.test(email) || email.length > 254 || role.length < 2 || role.length > 120 || company.length > 160 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 2000 || !status) {
    res.status(400).json({ success: false, message: 'Please provide valid review details.' })
    return
  }

  try {
    const review = await updateReview(id, { name, email, role, company: company || null, rating, comment, status })
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' })
      return
    }
    res.json({ success: true, data: review })
  } catch (error) {
    console.error('Review update failed', error)
    res.status(503).json({ success: false, message: 'Review could not be updated.' })
  }
}

const changeStatus = (status: 'APPROVED' | 'REJECTED') => async (req: Request, res: Response) => {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ success: false, message: 'Invalid review id.' })
    return
  }

  try {
    const review = await updateReviewStatus(id, status)
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' })
      return
    }
    res.json({ success: true, data: review })
  } catch (error) {
    console.error('Review status update failed', error)
    res.status(503).json({ success: false, message: 'Review status could not be updated.' })
  }
}

export const approveReview = changeStatus('APPROVED')
export const rejectReview = changeStatus('REJECTED')

export const removeReview = async (req: Request, res: Response) => {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ success: false, message: 'Invalid review id.' })
    return
  }

  try {
    if (!await deleteReview(id)) {
      res.status(404).json({ success: false, message: 'Review not found.' })
      return
    }
    res.status(204).send()
  } catch (error) {
    console.error('Review deletion failed', error)
    res.status(503).json({ success: false, message: 'Review could not be deleted.' })
  }
}
