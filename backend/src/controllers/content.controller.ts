import type { Request, Response } from 'express'
import { findAboutContent, findActiveAudio, findActiveCv, findCertificates, findEducation, findEnabledTools, findExperiences, findProfile, findSkillGroups, findSocialLinks } from '../repositories/content.repository'

export const getPublicContent = async (_req: Request, res: Response) => {
  try {
    const [about, profile, socialLinks, skills, experience, education, cv, certificates, audio, tools] = await Promise.all([
      findAboutContent(), findProfile(), findSocialLinks(), findSkillGroups(), findExperiences(), findEducation(), findActiveCv(), findCertificates(), findActiveAudio(), findEnabledTools(),
    ])
    res.json({ success: true, data: { about, profile, socialLinks, skills, experience, education, cv, certificates, audio, tools } })
  } catch (error) {
    console.error('Public content lookup failed', error)
    res.status(503).json({ success: false, message: 'Portfolio content is temporarily unavailable.' })
  }
}
