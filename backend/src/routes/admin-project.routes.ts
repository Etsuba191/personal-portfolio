import { Router } from 'express'
import { requireAdmin } from '../middleware/admin-auth.middleware'
import { createAdminProject, deleteAdminProject, listAdminProjects, publishAdminProject, updateAdminProject } from '../controllers/admin-project.controller'
import multer from 'multer'
import { removeAdminProjectImage, reorderAdminProjectImages, uploadAdminProjectImage } from '../controllers/admin-project-image.controller'

const router = Router()
router.use(requireAdmin)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
router.get('/', listAdminProjects)
router.post('/', createAdminProject)
router.patch('/:id', updateAdminProject)
router.patch('/:id/publication', publishAdminProject)
router.delete('/:id', deleteAdminProject)
router.post('/:id/images', upload.single('image'), uploadAdminProjectImage)
router.patch('/:id/images/reorder', reorderAdminProjectImages)
router.delete('/:id/images/:imageId', removeAdminProjectImage)

export default router