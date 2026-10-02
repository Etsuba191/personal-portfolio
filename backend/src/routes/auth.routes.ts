import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, session } from '../controllers/auth.controller'
import { requireAdmin } from '../middleware/admin-auth.middleware'

const router = Router()
const loginLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: { success: false, message: 'Too many login attempts. Please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
})

router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/session', requireAdmin, session)

export default router
