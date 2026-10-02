import type { Project } from '../types/project'
import { getPortfolioProject, portfolioProjects, type PortfolioProject } from '../data/portfolioProjects'
import { apiRequest } from './request'

export const getProjects = async (): Promise<Project[]> => {
  const result = await apiRequest<{ data: Project[] }>('/projects')
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
    const result = await apiRequest<{ data: CmsProject[] }>('/projects/published')
    if (!Array.isArray(result.data) || result.data.length === 0) {
      return portfolioProjects.map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }))
    }
    const cmsProjects = result.data.map(toPortfolioProject)
    const cmsSlugs = new Set(cmsProjects.map((project) => project.slug))
    return [...cmsProjects, ...portfolioProjects.filter((project) => !cmsSlugs.has(project.slug))]
      .map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }))
  } catch {
    return portfolioProjects.map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }))
  }
}

export const getPublishedPortfolioProject = async (slug: string): Promise<PortfolioProject> => {
  try {
    const result = await apiRequest<{ data: CmsProject | null }>(`/projects/published/${encodeURIComponent(slug)}`)
    if (result.data) {
      const project = toPortfolioProject(result.data)
      const orderedProject = (await getPublishedPortfolioProjects()).find((item) => item.slug === project.slug)
      return orderedProject ?? project
    }
  } catch {
    // Fall through to the local migration snapshot.
  }
  const fallback = getPortfolioProject(slug)
  if (fallback) return fallback
  throw new Error('Project not found.')
}
