import { Router } from 'express'
import { downloadActiveCv, getPublicContent } from '../controllers/content.controller'

const router = Router()
router.get('/cv/download', downloadActiveCv)
router.get('/', getPublicContent)

export default router
