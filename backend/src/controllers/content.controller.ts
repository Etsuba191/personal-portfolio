import type { Request, Response } from 'express'
import { findAboutContent, findActiveAudio, findActiveCv, findCertificates, findEducation, findEnabledTools, findExperiences, findProfile, findSkillGroups, findSocialLinks } from '../repositories/content.repository'

export const getPublicContent = async (_req: Request, res: Response) => {
  const entries = await Promise.allSettled([
    findAboutContent(), findProfile(), findSocialLinks(), findSkillGroups(), findExperiences(), findEducation(), findActiveCv(), findCertificates(), findActiveAudio(), findEnabledTools(),
  ])
  const names = ['about', 'profile', 'socialLinks', 'skills', 'experience', 'education', 'cv', 'certificates', 'audio', 'tools'] as const
  const data: Record<string, unknown> = {}
  const errors: Record<string, string> = {}
  entries.forEach((entry, index) => {
    if (entry.status === 'fulfilled') data[names[index]] = entry.value
    else { console.error(`Public ${names[index]} lookup failed`, entry.reason); data[names[index]] = null; errors[names[index]] = 'Temporarily unavailable.' }
  })
  res.json({ success: Object.keys(errors).length === 0, data, ...(Object.keys(errors).length > 0 ? { errors } : {}) })
}

export const downloadActiveCv = async (_req: Request, res: Response) => {
  try {
    const cv = await findActiveCv()
    if (!cv) { res.status(404).json({ success: false, message: 'No CV is currently available.' }); return }

    const upstream = await fetch(cv.url, { signal: AbortSignal.timeout(15000) })
    if (!upstream.ok) { res.status(503).json({ success: false, message: 'The CV file is temporarily unavailable.' }); return }

    const safeFileName = cv.fileName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'cv.pdf'
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(cv.fileName)}`)
    const contentLength = upstream.headers.get('content-length')
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.send(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    console.error('CV download failed', error)
    res.status(503).json({ success: false, message: 'The CV file is temporarily unavailable.' })
  }
}
