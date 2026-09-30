import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../middleware/admin-auth.middleware'
import { approveReview, getAdminReviews, getPublicReviews, rejectReview, removeReview, submitReview, updateAdminReview } from '../controllers/review.controller'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.post('/', upload.single('photo'), submitReview)
router.get('/', getPublicReviews)
router.get('/admin', requireAdmin, getAdminReviews)
router.patch('/:id', requireAdmin, updateAdminReview)
router.patch('/:id/approve', requireAdmin, approveReview)
router.patch('/:id/reject', requireAdmin, rejectReview)
router.delete('/:id', requireAdmin, removeReview)

export default router
