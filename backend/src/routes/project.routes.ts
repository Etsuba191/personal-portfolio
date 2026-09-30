import { Router } from 'express'
import { getProjects, getPublishedProjectDetail, getPublishedProjectList } from '../controllers/project.controller'

const router = Router()

router.get('/', getProjects)
router.get('/published', getPublishedProjectList)
router.get('/published/:slug', getPublishedProjectDetail)

export default router