import type { Request, Response } from 'express'
import { createCmsProject, deleteCmsProject, findAllCmsProjects, findProjectImages, setProjectPublished, updateCmsProject } from '../repositories/project.repository'
import type { ProjectInput } from '../types/project'
import { deleteProjectImageAsset } from '../services/review-image.service'

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : []
const booleanValue = (value: unknown) => value === true

const inputFrom = (body: Record<string, unknown>): ProjectInput => ({
  title: text(body.title),
  slug: text(body.slug),
  category: text(body.category),
  shortDescription: text(body.shortDescription),
  overview: text(body.overview),
  problem: text(body.problem),
  approach: text(body.approach),
  solution: text(body.solution),
  technologies: list(body.technologies),
  keyFeatures: list(body.keyFeatures),
  result: text(body.result),
  reflection: text(body.reflection),
  projectType: text(body.projectType),
  featured: booleanValue(body.featured),
  published: booleanValue(body.published),
  githubUrl: text(body.githubUrl) || null,
  liveUrl: text(body.liveUrl) || null,
  videoUrl: text(body.videoUrl) || null,
  coverImage: text(body.coverImage) || null,
})

const valid = (input: ProjectInput) => input.title.length >= 2 && input.slug.length >= 2 && input.category.length >= 2 && input.shortDescription.length >= 2 && input.overview.length >= 2 && input.problem.length >= 2 && input.approach.length >= 2 && input.solution.length >= 2 && input.projectType.length >= 2 && input.result.length >= 2 && input.reflection.length >= 2
const idOf = (value: unknown) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null

export const listAdminProjects = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await findAllCmsProjects() }) } catch (error) { console.error('Admin projects lookup failed', error); res.status(503).json({ success: false, message: 'Projects are temporarily unavailable.' }) }
}

export const createAdminProject = async (req: Request, res: Response) => {
  const input = inputFrom(req.body as Record<string, unknown>)
  if (!valid(input)) { res.status(400).json({ success: false, message: 'Complete the required project fields.' }); return }
  try { res.status(201).json({ success: true, data: await createCmsProject(input) }) } catch (error) { console.error('Admin project creation failed', error); res.status(400).json({ success: false, message: 'Project could not be created. Check that its slug is unique.' }) }
}

export const updateAdminProject = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  const input = inputFrom(req.body as Record<string, unknown>)
  if (!id || !valid(input)) { res.status(400).json({ success: false, message: 'Complete the required project fields.' }); return }
  try { const project = await updateCmsProject(id, input); if (!project) { res.status(404).json({ success: false, message: 'Project not found.' }); return } res.json({ success: true, data: project }) } catch (error) { console.error('Admin project update failed', error); res.status(400).json({ success: false, message: 'Project could not be updated. Check that its slug is unique.' }) }
}

export const publishAdminProject = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { res.status(400).json({ success: false, message: 'Invalid project id.' }); return }
  try { const project = await setProjectPublished(id, req.body?.published === true); if (!project) { res.status(404).json({ success: false, message: 'Project not found.' }); return } res.json({ success: true, data: project }) } catch (error) { console.error('Admin project publication failed', error); res.status(503).json({ success: false, message: 'Project publication could not be updated.' }) }
}

export const deleteAdminProject = async (req: Request, res: Response) => {
  const id = idOf(req.params.id)
  if (!id) { res.status(400).json({ success: false, message: 'Invalid project id.' }); return }
  try {
    const cloudinaryIds = await findProjectImages(id)
    if (!await deleteCmsProject(id)) { res.status(404).json({ success: false, message: 'Project not found.' }); return }
    for (const cloudinaryId of cloudinaryIds) {
      try { await deleteProjectImageAsset(cloudinaryId) } catch (cleanupError) { console.error('Project image asset cleanup failed', cleanupError) }
    }
    res.status(204).send()
  } catch (error) { console.error('Admin project deletion failed', error); res.status(503).json({ success: false, message: 'Project could not be deleted.' }) }
}