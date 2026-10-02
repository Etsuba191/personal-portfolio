import type { Request, Response } from 'express'
import {
  createAudio,
  createCertificate,
  createEducation,
  createExperience,
  createSkillGroup,
  createSocialLink,
  createTool,
  deleteAudio,
  deleteCertificate,
  deleteEducation,
  deleteExperience,
  deleteSkillGroup,
  deleteSocialLink,
  deleteTool,
  findAboutContent,
  findActiveAudio,
  findAllAudio,
  findAllTools,
  findAudio,
  findAudioDetails,
  findCertificateDetails,
  findCertificates,
  findEducation,
  findEducationEntry,
  findExperience,
  findExperiences,
  findProfile,
  findServices,
  findSkillGroup,
  findSkillGroups,
  findSocialLink,
  findSocialLinks,
  findTool,
  reorderAudio,
  reorderCertificates,
  reorderEducation,
  reorderExperiences,
  reorderSkillGroups,
  reorderSocialLinks,
  reorderTools,
  saveAboutContent,
  saveActiveCv,
  saveProfile,
  saveServices,
  saveProfileImage,
  updateAudio,
  updateCertificate,
  updateCertificateFile,
  updateEducation,
  updateExperience,
  updateSkillGroup,
  updateSocialLink,
  updateTool,
} from '../repositories/content.repository'
import { deleteAudioAsset, deleteCertificateAsset, deleteProjectImageAsset, uploadAudioFile, uploadCertificateFile, uploadCvDocument, uploadProjectImage } from '../services/review-image.service'

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const optionalText = (value: unknown, max: number) => {
  const result = text(value, max)
  return result || null
}
const list = (value: unknown, max: number) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, max)).filter(Boolean) : []
const idOf = (value: unknown) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null
const supportedPlatforms = new Set(['github', 'linkedin', 'telegram', 'instagram'])
const validUrl = (value: string | null) => !value || /^https?:\/\/.+\..+/.test(value)

const respondNotFound = (res: Response, resource: string) => res.status(404).json({ success: false, message: `${resource} not found.` })
const respondInvalid = (res: Response, message: string) => res.status(400).json({ success: false, message })

export const getAdminContent = async (_req: Request, res: Response) => {
  const entries = await Promise.allSettled([
    findAboutContent(), findProfile(), findSocialLinks(), findSkillGroups(), findExperiences(), findEducation(), findCertificates(),
  ])
  const names = ['about', 'profile', 'socialLinks', 'skills', 'experience', 'education', 'certificates'] as const
  const data: Record<string, unknown> = {}
  const errors: Record<string, string> = {}
  entries.forEach((entry, index) => {
    if (entry.status === 'fulfilled') data[names[index]] = entry.value
    else { console.error(`Admin ${names[index]} lookup failed`, entry.reason); data[names[index]] = null; errors[names[index]] = 'Temporarily unavailable.' }
  })
  res.json({ success: Object.keys(errors).length === 0, data, ...(Object.keys(errors).length > 0 ? { errors } : {}) })
}

export const saveAdminContent = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const aboutBody = body.about as Record<string, unknown> | undefined
  const heading = text(aboutBody?.heading, 160)
  const paragraphs = list(aboutBody?.paragraphs, 5000)
  if (!heading || paragraphs.length === 0) { respondInvalid(res, 'About content requires a heading and paragraph.'); return }
  try {
    const services = await findServices()
    await saveAboutContent(heading, paragraphs, services)
    res.json({ success: true })
  } catch (error) {
    console.error('Admin content save failed', error)
    res.status(503).json({ success: false, message: 'Portfolio content could not be saved.' })
  }
}

export const saveAdminAbout = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const heading = text(body.heading, 160)
  const paragraphs = list(body.paragraphs, 5000)
  if (!heading || paragraphs.length === 0) { respondInvalid(res, 'About content requires a heading and paragraph.'); return }
  try {
    const services = await findServices()
    await saveAboutContent(heading, paragraphs, services)
    res.json({ success: true })
  } catch (error) {
    console.error('Admin about save failed', error)
    res.status(503).json({ success: false, message: 'About content could not be saved.' })
  }
}

export const getAdminProfile = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findProfile() }) } catch (error) { console.error('Admin profile lookup failed', error); res.status(503).json({ success: false, message: 'Profile is temporarily unavailable.' }) }
}

export const saveAdminProfile = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const input = {
    name: optionalText(body.name, 120),
    professionalTitle: optionalText(body.professionalTitle, 120),
    shortIntroduction: optionalText(body.shortIntroduction, 500),
    location: optionalText(body.location, 160),
    email: optionalText(body.email, 254),
    phone: optionalText(body.phone, 40),
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) { respondInvalid(res, 'Enter a valid email address.'); return }
  try { res.json({ success: true, data: await saveProfile(input) }) } catch (error) { console.error('Admin profile save failed', error); res.status(503).json({ success: false, message: 'Profile could not be saved.' }) }
}

export const listAdminSocialLinks = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findSocialLinks() }) } catch (error) { console.error('Admin social link lookup failed', error); res.status(503).json({ success: false, message: 'Social links are temporarily unavailable.' }) }
}

export const createAdminSocialLink = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const platform = text(body.platform, 40).toLowerCase()
  const input = { platform, label: text(body.label, 80) || platform, url: text(body.url, 1000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!supportedPlatforms.has(platform) || !input.label || !validUrl(input.url)) { respondInvalid(res, 'Provide a supported platform, label, and valid URL.'); return }
  try { res.status(201).json({ success: true, data: await createSocialLink(input) }) } catch (error) { console.error('Admin social link creation failed', error); res.status(400).json({ success: false, message: 'Social link could not be created. Check that the platform is unique.' }) }
}

export const updateAdminSocialLink = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  const platform = text(body.platform, 40).toLowerCase()
  const input = { platform, label: text(body.label, 80) || platform, url: text(body.url, 1000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!id || !supportedPlatforms.has(platform) || !input.label || !validUrl(input.url)) { respondInvalid(res, 'Provide a supported platform, label, and valid URL.'); return }
  try { const link = await updateSocialLink(id, input); if (!link) return respondNotFound(res, 'Social link'); res.json({ success: true, data: link }) } catch (error) { console.error('Admin social link update failed', error); res.status(400).json({ success: false, message: 'Social link could not be updated. Check that the platform is unique.' }) }
}

export const reorderAdminSocialLinks = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of social link ids.'); return }
  try { await reorderSocialLinks(ids); res.json({ success: true }) } catch (error) { console.error('Admin social link reorder failed', error); res.status(503).json({ success: false, message: 'Social links could not be reordered.' }) }
}

export const removeAdminSocialLink = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid social link id.'); return }
  try { if (!await findSocialLink(id)) return respondNotFound(res, 'Social link'); if (!await deleteSocialLink(id)) return respondNotFound(res, 'Social link'); res.status(204).send() } catch (error) { console.error('Admin social link deletion failed', error); res.status(503).json({ success: false, message: 'Social link could not be deleted.' }) }
}

export const listAdminEducation = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findEducation() }) } catch (error) { console.error('Admin education lookup failed', error); res.status(503).json({ success: false, message: 'Education is temporarily unavailable.' }) }
}

export const createAdminEducation = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const input = { institution: text(body.institution, 180), degree: text(body.degree, 180), startDate: optionalText(body.startDate, 40), endDate: optionalText(body.endDate, 40), description: optionalText(body.description, 4000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!input.institution || !input.degree) { respondInvalid(res, 'Institution and degree are required.'); return }
  try { res.status(201).json({ success: true, data: await createEducation(input) }) } catch (error) { console.error('Admin education creation failed', error); res.status(503).json({ success: false, message: 'Education could not be created.' }) }
}

export const updateAdminEducation = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  const input = { institution: text(body.institution, 180), degree: text(body.degree, 180), startDate: optionalText(body.startDate, 40), endDate: optionalText(body.endDate, 40), description: optionalText(body.description, 4000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!id || !input.institution || !input.degree) { respondInvalid(res, 'Institution and degree are required.'); return }
  try { const entry = await updateEducation(id, input); if (!entry) return respondNotFound(res, 'Education'); res.json({ success: true, data: entry }) } catch (error) { console.error('Admin education update failed', error); res.status(503).json({ success: false, message: 'Education could not be updated.' }) }
}

export const reorderAdminEducation = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of education ids.'); return }
  try { await reorderEducation(ids); res.json({ success: true }) } catch (error) { console.error('Admin education reorder failed', error); res.status(503).json({ success: false, message: 'Education could not be reordered.' }) }
}

export const removeAdminEducation = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid education id.'); return }
  try { if (!await findEducationEntry(id)) return respondNotFound(res, 'Education'); if (!await deleteEducation(id)) return respondNotFound(res, 'Education'); res.status(204).send() } catch (error) { console.error('Admin education deletion failed', error); res.status(503).json({ success: false, message: 'Education could not be deleted.' }) }
}

export const listAdminSkills = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findSkillGroups() }) } catch (error) { console.error('Admin skills lookup failed', error); res.status(503).json({ success: false, message: 'Skills are temporarily unavailable.' }) }
}

export const createAdminSkill = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const input = { title: text(body.title, 100), skills: list(body.skills, 80), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!input.title) { respondInvalid(res, 'Skill group title is required.'); return }
  try { res.status(201).json({ success: true, data: await createSkillGroup(input) }) } catch (error) { console.error('Admin skill creation failed', error); res.status(400).json({ success: false, message: 'Skill group could not be created. Check that its title is unique.' }) }
}

export const updateAdminSkill = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  const input = { title: text(body.title, 100), skills: list(body.skills, 80), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!id || !input.title) { respondInvalid(res, 'Skill group title is required.'); return }
  try { const group = await updateSkillGroup(id, input); if (!group) return respondNotFound(res, 'Skill group'); res.json({ success: true, data: group }) } catch (error) { console.error('Admin skill update failed', error); res.status(400).json({ success: false, message: 'Skill group could not be updated. Check that its title is unique.' }) }
}

export const reorderAdminSkills = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of skill group ids.'); return }
  try { await reorderSkillGroups(ids); res.json({ success: true }) } catch (error) { console.error('Admin skills reorder failed', error); res.status(503).json({ success: false, message: 'Skills could not be reordered.' }) }
}

export const removeAdminSkill = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid skill group id.'); return }
  try { if (!await findSkillGroup(id)) return respondNotFound(res, 'Skill group'); if (!await deleteSkillGroup(id)) return respondNotFound(res, 'Skill group'); res.status(204).send() } catch (error) { console.error('Admin skill deletion failed', error); res.status(503).json({ success: false, message: 'Skill group could not be deleted.' }) }
}

export const listAdminExperience = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findExperiences() }) } catch (error) { console.error('Admin experience lookup failed', error); res.status(503).json({ success: false, message: 'Experience is temporarily unavailable.' }) }
}

export const createAdminExperience = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  const input = { organization: text(body.organization, 160), role: text(body.role, 160), division: optionalText(body.division, 160), startDate: text(body.startDate, 40), endDate: text(body.endDate, 40), description: optionalText(body.description, 4000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!input.organization || !input.role || !input.startDate || !input.endDate) { respondInvalid(res, 'Organization, role, and dates are required.'); return }
  try { res.status(201).json({ success: true, data: await createExperience(input) }) } catch (error) { console.error('Admin experience creation failed', error); res.status(503).json({ success: false, message: 'Experience could not be created.' }) }
}

export const updateAdminExperience = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  const input = { organization: text(body.organization, 160), role: text(body.role, 160), division: optionalText(body.division, 160), startDate: text(body.startDate, 40), endDate: text(body.endDate, 40), description: optionalText(body.description, 4000), sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined }
  if (!id || !input.organization || !input.role || !input.startDate || !input.endDate) { respondInvalid(res, 'Organization, role, and dates are required.'); return }
  try { const item = await updateExperience(id, input); if (!item) return respondNotFound(res, 'Experience'); res.json({ success: true, data: item }) } catch (error) { console.error('Admin experience update failed', error); res.status(503).json({ success: false, message: 'Experience could not be updated.' }) }
}

export const reorderAdminExperience = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of experience ids.'); return }
  try { await reorderExperiences(ids); res.json({ success: true }) } catch (error) { console.error('Admin experience reorder failed', error); res.status(503).json({ success: false, message: 'Experience could not be reordered.' }) }
}

export const removeAdminExperience = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid experience id.'); return }
  try { if (!await findExperience(id)) return respondNotFound(res, 'Experience'); if (!await deleteExperience(id)) return respondNotFound(res, 'Experience'); res.status(204).send() } catch (error) { console.error('Admin experience deletion failed', error); res.status(503).json({ success: false, message: 'Experience could not be deleted.' }) }
}

export const listAdminServices = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findServices() }) } catch (error) { console.error('Admin services lookup failed', error); res.status(503).json({ success: false, message: 'Services are temporarily unavailable.' }) }
}

export const saveAdminServices = async (req: Request, res: Response) => {
  const services = Array.isArray(req.body?.services) ? (req.body.services as Array<Record<string, unknown>>).map((item) => item as Record<string, unknown>).map((item, index) => ({ number: text(item.number, 10) || String(index + 1).padStart(2, '0'), icon: text(item.icon, 20), title: text(item.title, 120), description: text(item.description, 500) })).filter((item) => item.title && item.description) : []
  if (!services.length) { respondInvalid(res, 'At least one service is required.'); return }
  try { res.json({ success: true, data: await saveServices(services) }) } catch (error) { console.error('Admin services save failed', error); res.status(503).json({ success: false, message: 'Services could not be saved.' }) }
}

export const uploadAdminCv = async (req: Request, res: Response) => {
  if (!req.file || req.file.mimetype !== 'application/pdf') { respondInvalid(res, 'Upload a PDF CV.'); return }
  try {
    const uploaded = await uploadCvDocument(req.file)
    const cv = await saveActiveCv(uploaded.url, uploaded.publicId, req.file.originalname.slice(0, 180))
    res.status(201).json({ success: true, data: cv })
  } catch (error) {
    console.error('Admin CV upload failed', error)
    res.status(503).json({ success: false, message: 'CV could not be uploaded.' })
  }
}

export const uploadAdminProfileImage = async (req: Request, res: Response) => {
  if (!req.file || !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) { respondInvalid(res, 'Upload a JPG, PNG, or WebP profile image.'); return }
  try {
    const uploaded = await uploadProjectImage(req.file)
    const profile = await saveProfileImage(uploaded.url, uploaded.publicId)
    res.status(201).json({ success: true, data: profile })
  } catch (error) {
    console.error('Admin profile image upload failed', error)
    res.status(503).json({ success: false, message: 'Profile image could not be uploaded.' })
  }
}

export const createAdminCertificate = async (req: Request, res: Response) => {
  const title = text(req.body.title, 180)
  const issuer = text(req.body.issuer, 160)
  const issueDate = optionalText(req.body.issueDate, 40)
  const credentialUrl = optionalText(req.body.credentialUrl, 1000)
  if (!title || !issuer || !req.file || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype) || (credentialUrl && !validUrl(credentialUrl))) {
    respondInvalid(res, 'Provide a title, issuer, and PDF or image certificate.')
    return
  }
  let uploaded: { url: string; publicId: string } | null = null
  try {
    uploaded = await uploadCertificateFile(req.file)
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' as const : 'image' as const
    const certificate = await createCertificate({ title, issuer, issueDate, credentialUrl, fileUrl: uploaded.url, publicId: uploaded.publicId, resourceType, fileName: req.file.originalname.slice(0, 180) })
    if (!certificate) { await deleteCertificateAsset(uploaded.publicId, resourceType); uploaded = null; return respondNotFound(res, 'Certificate') }
    res.status(201).json({ success: true, data: certificate })
  } catch (error) {
    if (uploaded) {
      try { await deleteCertificateAsset(uploaded.publicId, req.file!.mimetype === 'application/pdf' ? 'raw' : 'image') } catch (cleanupError) { console.error('Uploaded certificate cleanup failed', cleanupError) }
    }
    console.error('Admin certificate upload failed', error)
    res.status(503).json({ success: false, message: 'Certificate could not be uploaded.' })
  }
}

export const listAdminCertificates = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findCertificates() }) } catch (error) { console.error('Admin certificate lookup failed', error); res.status(503).json({ success: false, message: 'Certificates are temporarily unavailable.' }) }
}

export const updateAdminCertificate = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  const title = text(body.title, 180)
  const issuer = text(body.issuer, 160)
  const issueDate = optionalText(body.issueDate, 40)
  const credentialUrl = optionalText(body.credentialUrl, 1000)
  if (!id || !title || !issuer || (credentialUrl && !validUrl(credentialUrl))) { respondInvalid(res, 'Certificate title and issuer are required.'); return }
  try { const certificate = await updateCertificate(id, { title, issuer, issueDate, credentialUrl }); if (!certificate) return respondNotFound(res, 'Certificate'); res.json({ success: true, data: certificate }) } catch (error) { console.error('Admin certificate update failed', error); res.status(503).json({ success: false, message: 'Certificate could not be updated.' }) }
}

export const replaceAdminCertificateFile = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id || !req.file || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) { respondInvalid(res, 'Upload a PDF, JPG, PNG, or WebP certificate.'); return }
  let uploaded: { url: string; publicId: string } | null = null
  try {
    const existing = await findCertificateDetails(id)
    if (!existing) return respondNotFound(res, 'Certificate')
    uploaded = await uploadCertificateFile(req.file)
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' as const : 'image' as const
    const certificate = await updateCertificateFile(id, uploaded.url, uploaded.publicId, resourceType, req.file.originalname.slice(0, 180))
    if (!certificate) { await deleteCertificateAsset(uploaded.publicId, resourceType); uploaded = null; return respondNotFound(res, 'Certificate') }
    if (existing.publicId && existing.publicId !== uploaded.publicId) {
      try { await deleteCertificateAsset(existing.publicId, existing.resourceType) } catch (cleanupError) { console.error('Old certificate asset cleanup failed', cleanupError) }
    }
    res.json({ success: true, data: certificate })
  } catch (error) {
    if (uploaded) {
      try { await deleteCertificateAsset(uploaded.publicId, req.file!.mimetype === 'application/pdf' ? 'raw' : 'image') } catch (cleanupError) { console.error('Uploaded certificate cleanup failed', cleanupError) }
    }
    console.error('Admin certificate replacement failed', error)
    res.status(503).json({ success: false, message: 'Certificate could not be replaced.' })
  }
}

export const reorderAdminCertificates = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of certificate ids.'); return }
  try { await reorderCertificates(ids); res.json({ success: true }) } catch (error) { console.error('Admin certificate reorder failed', error); res.status(503).json({ success: false, message: 'Certificates could not be reordered.' }) }
}

export const removeAdminCertificate = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid certificate id.'); return }
  try {
    const certificate = await findCertificateDetails(id)
    if (!certificate || !await deleteCertificate(id)) return respondNotFound(res, 'Certificate')
    if (certificate.publicId) await deleteCertificateAsset(certificate.publicId, certificate.resourceType)
    res.status(204).send()
  } catch (error) {
    console.error('Admin certificate deletion failed', error)
    res.status(503).json({ success: false, message: 'Certificate could not be deleted.' })
  }
}

export const listAdminAudio = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findAllAudio() }) } catch (error) { console.error('Admin audio lookup failed', error); res.status(503).json({ success: false, message: 'Audio is temporarily unavailable.' }) }
}

export const createAdminAudio = async (req: Request, res: Response) => {
  if (!req.file || !['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'].includes(req.file.mimetype)) {
    respondInvalid(res, 'Upload an MP3, WAV, OGG, or WebM audio file.'); return
  }
  const body = req.body as Record<string, unknown>
  let uploaded: { url: string; publicId: string } | null = null
  try {
    uploaded = await uploadAudioFile(req.file)
    const audio = await createAudio({
      url: uploaded.url,
      publicId: uploaded.publicId,
      fileName: req.file.originalname.slice(0, 180),
      enabled: Boolean(body.enabled ?? true),
      loop: Boolean(body.loop ?? true),
      volume: typeof body.volume === 'number' ? Math.max(0, Math.min(1, body.volume)) : 0.5,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
    })
    res.status(201).json({ success: true, data: audio })
  } catch (error) {
    if (uploaded) {
      try { await deleteAudioAsset(uploaded.publicId) } catch (cleanupError) { console.error('Uploaded audio cleanup failed', cleanupError) }
    }
    console.error('Admin audio upload failed', error)
    res.status(503).json({ success: false, message: 'Audio could not be uploaded.' })
  }
}

export const updateAdminAudio = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  if (!id) { respondInvalid(res, 'Invalid audio id.'); return }
  const file = req.file
  let uploaded: { url: string; publicId: string } | null = null
  try {
    if (file && ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'].includes(file.mimetype)) {
      uploaded = await uploadAudioFile(file)
    }
    const input = {
      url: uploaded?.url,
      publicId: uploaded?.publicId ?? (body.publicId === '' ? null : (body.publicId as string | null)),
      fileName: uploaded ? file?.originalname.slice(0, 180) : (typeof body.fileName === 'string' ? body.fileName.slice(0, 180) : undefined),
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
      loop: body.loop !== undefined ? Boolean(body.loop) : undefined,
      volume: typeof body.volume === 'number' ? Math.max(0, Math.min(1, body.volume)) : undefined,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
    }
    const audio = await updateAudio(id, input)
    if (!audio) return respondNotFound(res, 'Audio')
    if (uploaded && audio.publicId && audio.publicId !== uploaded.publicId) {
      try { await deleteAudioAsset(audio.publicId) } catch (cleanupError) { console.error('Old audio cleanup failed', cleanupError) }
    }
    res.json({ success: true, data: audio })
  } catch (error) {
    if (uploaded) {
      try { await deleteAudioAsset(uploaded.publicId) } catch (cleanupError) { console.error('Uploaded audio cleanup failed', cleanupError) }
    }
    console.error('Admin audio update failed', error)
    res.status(503).json({ success: false, message: 'Audio could not be updated.' })
  }
}

export const removeAdminAudio = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid audio id.'); return }
  try {
    const audio = await findAudio(id)
    if (!audio) return respondNotFound(res, 'Audio')
    if (audio.publicId) await deleteAudioAsset(audio.publicId)
    if (!await deleteAudio(id)) return respondNotFound(res, 'Audio')
    res.status(204).send()
  } catch (error) {
    console.error('Admin audio deletion failed', error)
    res.status(503).json({ success: false, message: 'Audio could not be deleted.' })
  }
}

export const listAdminTools = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findAllTools() }) } catch (error) { console.error('Admin tools lookup failed', error); res.status(503).json({ success: false, message: 'Tools are temporarily unavailable.' }) }
}

export const createAdminTool = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>
  let uploaded: { url: string; publicId: string } | null = null
  try {
    if (req.file && ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(req.file.mimetype)) {
      uploaded = await uploadProjectImage(req.file)
    }
    const tool = await createTool({
      name: text(body.name, 100),
      iconUrl: uploaded?.url,
      iconPublicId: uploaded?.publicId,
      category: optionalText(body.category, 60),
      enabled: Boolean(body.enabled ?? true),
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
      skillGroupId: typeof body.skillGroupId === 'number' ? body.skillGroupId : undefined,
    })
    res.status(201).json({ success: true, data: tool })
  } catch (error) {
    if (uploaded) {
      try { await deleteProjectImageAsset(uploaded.publicId) } catch (cleanupError) { console.error('Uploaded tool icon cleanup failed', cleanupError) }
    }
    console.error('Admin tool creation failed', error)
    res.status(503).json({ success: false, message: 'Tool could not be created.' })
  }
}

export const updateAdminTool = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const body = req.body as Record<string, unknown>
  if (!id) { respondInvalid(res, 'Invalid tool id.'); return }
  const file = req.file
  let uploaded: { url: string; publicId: string } | null = null
  try {
    if (file && ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.mimetype)) {
      uploaded = await uploadProjectImage(file)
    }
    const input = {
      name: text(body.name, 100) || undefined,
      iconUrl: uploaded?.url,
      iconPublicId: uploaded?.publicId ?? (body.iconPublicId === '' ? null : (body.iconPublicId as string | null)),
      category: optionalText(body.category, 60),
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
      skillGroupId: typeof body.skillGroupId === 'number' ? body.skillGroupId : (body.skillGroupId === '' ? null : undefined),
    }
    const tool = await updateTool(id, input)
    if (!tool) return respondNotFound(res, 'Tool')
    if (uploaded && tool.iconPublicId && tool.iconPublicId !== uploaded.publicId) {
      try { await deleteProjectImageAsset(tool.iconPublicId) } catch (cleanupError) { console.error('Old tool icon cleanup failed', cleanupError) }
    }
    res.json({ success: true, data: tool })
  } catch (error) {
    if (uploaded) {
      try { await deleteProjectImageAsset(uploaded.publicId) } catch (cleanupError) { console.error('Uploaded tool icon cleanup failed', cleanupError) }
    }
    console.error('Admin tool update failed', error)
    res.status(503).json({ success: false, message: 'Tool could not be updated.' })
  }
}

export const removeAdminTool = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { respondInvalid(res, 'Invalid tool id.'); return }
  try {
    const tool = await findTool(id)
    if (!tool) return respondNotFound(res, 'Tool')
    if (tool.iconPublicId) await deleteProjectImageAsset(tool.iconPublicId)
    if (!await deleteTool(id)) return respondNotFound(res, 'Tool')
    res.status(204).send()
  } catch (error) {
    console.error('Admin tool deletion failed', error)
    res.status(503).json({ success: false, message: 'Tool could not be deleted.' })
  }
}

export const reorderAdminTools = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of tool ids.'); return }
  try { await reorderTools(ids); res.json({ success: true }) } catch (error) { console.error('Admin tools reorder failed', error); res.status(503).json({ success: false, message: 'Tools could not be reordered.' }) }
}

export const reorderAdminAudio = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0) : []
  if (!ids.length) { respondInvalid(res, 'Provide an ordered list of audio ids.'); return }
  try { await reorderAudio(ids); res.json({ success: true }) } catch (error) { console.error('Admin audio reorder failed', error); res.status(503).json({ success: false, message: 'Audio could not be reordered.' }) }
}
