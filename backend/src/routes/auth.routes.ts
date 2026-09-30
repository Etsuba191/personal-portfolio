import { Router } from 'express'
import { login, logout, session } from '../controllers/auth.controller'
import { requireAdmin } from '../middleware/admin-auth.middleware'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/session', requireAdmin, session)

export default router
