import type { Project } from '../types/project'
import { getPortfolioProject, portfolioProjects, type PortfolioProject } from '../data/portfolioProjects'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/projects`)
  if (!response.ok) throw new Error('Failed to fetch projects')
  const result = await response.json()
  return result.data
}

type CmsProject = Omit<PortfolioProject, 'number' | 'description' | 'technologies' | 'features' | 'gallery' | 'github' | 'liveDemo' | 'media' | 'details'> & {
  id: number
  shortDescription: string
  technologies: string[]
  keyFeatures: string[]
  githubUrl: string | null
  liveUrl: string | null
  videoUrl: string | null
  coverImage: string | null
  galleryImages: Array<{ url: string; alt: string | null }>
  projectType: string
}

const toPortfolioProject = (project: CmsProject): PortfolioProject => ({
  slug: project.slug,
  number: String(project.id).padStart(2, '0'),
  title: project.title,
  category: project.category,
  description: project.shortDescription,
  technologies: project.technologies,
  overview: project.overview,
  problem: project.problem,
  approach: project.approach,
  solution: project.solution,
  features: project.keyFeatures,
  result: project.result,
  reflection: project.reflection,
  gallery: project.galleryImages.map((image) => image.url),
  github: project.githubUrl ?? undefined,
  liveDemo: project.liveUrl ?? undefined,
  media: project.videoUrl ? { type: 'video' as const, src: project.videoUrl } : project.coverImage ? { type: 'image' as const, src: project.coverImage, alt: project.title } : undefined,
  details: project.projectType,
})

export const getPublishedPortfolioProjects = async (): Promise<PortfolioProject[]> => {
  try {
    const response = await fetch(`${API_URL}/projects/published`)
    const result = await response.json()
    if (!response.ok) throw new Error(result.message ?? 'Failed to fetch published projects.')
    if (!Array.isArray(result.data) || result.data.length === 0) return portfolioProjects
    return result.data.map(toPortfolioProject)
  } catch {
    return portfolioProjects
  }
}

export const getPublishedPortfolioProject = async (slug: string): Promise<PortfolioProject> => {
  try {
    const response = await fetch(`${API_URL}/projects/published/${encodeURIComponent(slug)}`)
    const result = await response.json()
    if (!response.ok) throw new Error(result.message ?? 'Failed to fetch project.')
    if (result.data) return toPortfolioProject(result.data)
  } catch {
    // Fall through to the local migration snapshot.
  }
  const fallback = getPortfolioProject(slug)
  if (fallback) return fallback
  throw new Error('Project not found.')
}
