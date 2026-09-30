import { Router } from 'express'
import { getPublicContent } from '../controllers/content.controller'

const router = Router()
router.get('/', getPublicContent)

export default router
