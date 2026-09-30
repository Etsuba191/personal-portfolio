import { Router } from 'express'
import { requireAdmin } from '../middleware/admin-auth.middleware'
import multer from 'multer'
import {
  createAdminAudio,
  createAdminCertificate,
  createAdminEducation,
  createAdminExperience,
  createAdminSkill,
  createAdminSocialLink,
  createAdminTool,
  getAdminContent,
  getAdminProfile,
  listAdminAudio,
  listAdminCertificates,
  listAdminEducation,
  listAdminExperience,
  listAdminSkills,
  listAdminServices,
  listAdminSocialLinks,
  listAdminTools,
  removeAdminAudio,
  removeAdminCertificate,
  removeAdminEducation,
  removeAdminExperience,
  removeAdminSkill,
  removeAdminSocialLink,
  removeAdminTool,
  reorderAdminAudio,
  reorderAdminCertificates,
  reorderAdminEducation,
  reorderAdminExperience,
  reorderAdminSkills,
  reorderAdminSocialLinks,
  reorderAdminTools,
  replaceAdminCertificateFile,
  saveAdminContent,
  saveAdminAbout,
  saveAdminProfile,
  saveAdminServices,
  uploadAdminCv,
  uploadAdminProfileImage,
  updateAdminAudio,
  updateAdminCertificate,
  updateAdminEducation,
  updateAdminExperience,
  updateAdminSkill,
  updateAdminSocialLink,
  updateAdminTool,
} from '../controllers/admin-content.controller'

const router = Router()
router.use(requireAdmin)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', getAdminContent)
router.get('/profile', getAdminProfile)
router.put('/profile', saveAdminProfile)
router.put('/about', saveAdminAbout)
router.get('/social-links', listAdminSocialLinks)
router.post('/social-links', createAdminSocialLink)
router.patch('/social-links/reorder', reorderAdminSocialLinks)
router.patch('/social-links/:id', updateAdminSocialLink)
router.delete('/social-links/:id', removeAdminSocialLink)
router.get('/education', listAdminEducation)
router.post('/education', createAdminEducation)
router.patch('/education/reorder', reorderAdminEducation)
router.patch('/education/:id', updateAdminEducation)
router.delete('/education/:id', removeAdminEducation)
router.get('/skills', listAdminSkills)
router.post('/skills', createAdminSkill)
router.patch('/skills/reorder', reorderAdminSkills)
router.patch('/skills/:id', updateAdminSkill)
router.delete('/skills/:id', removeAdminSkill)
router.get('/experience', listAdminExperience)
router.post('/experience', createAdminExperience)
router.patch('/experience/reorder', reorderAdminExperience)
router.patch('/experience/:id', updateAdminExperience)
router.delete('/experience/:id', removeAdminExperience)
router.get('/services', listAdminServices)
router.put('/services', saveAdminServices)
router.post('/cv', upload.single('cv'), uploadAdminCv)
router.post('/profile-image', upload.single('image'), uploadAdminProfileImage)
router.get('/certificates', listAdminCertificates)
router.post('/certificates', upload.single('certificate'), createAdminCertificate)
router.patch('/certificates/reorder', reorderAdminCertificates)
router.patch('/certificates/:id', updateAdminCertificate)
router.patch('/certificates/:id/file', upload.single('certificate'), replaceAdminCertificateFile)
router.delete('/certificates/:id', removeAdminCertificate)

router.get('/audio', listAdminAudio)
router.post('/audio', upload.single('audio'), createAdminAudio)
router.patch('/audio/reorder', reorderAdminAudio)
router.patch('/audio/:id', updateAdminAudio)
router.delete('/audio/:id', removeAdminAudio)

router.get('/tools', listAdminTools)
router.post('/tools', upload.single('icon'), createAdminTool)
router.patch('/tools/reorder', reorderAdminTools)
router.patch('/tools/:id', upload.single('icon'), updateAdminTool)
router.delete('/tools/:id', removeAdminTool)

router.put('/', saveAdminContent)

export default router
