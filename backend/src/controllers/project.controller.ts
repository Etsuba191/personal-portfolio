import { Request, Response } from 'express'
import { getAllProjects, getPublishedProject, getPublishedProjects } from '../services/project.service'

export const getProjects = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getPublishedProjects() })
  } catch (error) {
    console.error('Published projects lookup failed', error)
    res.status(503).json({ success: false, message: 'Projects are temporarily unavailable.' })
  }
}

export const getPublishedProjectList = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getPublishedProjects() })
  } catch (error) {
    console.error('Published projects lookup failed', error)
    res.status(503).json({ success: false, message: 'Projects are temporarily unavailable.' })
  }
}

export const getPublishedProjectDetail = async (req: Request, res: Response) => {
  try {
    const slug = typeof req.params.slug === 'string' ? req.params.slug : ''
    const project = await getPublishedProject(slug)
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' })
      return
    }
    res.json({ success: true, data: project })
  } catch (error) {
    console.error('Published project lookup failed', error)
    res.status(503).json({ success: false, message: 'Project is temporarily unavailable.' })
  }
}