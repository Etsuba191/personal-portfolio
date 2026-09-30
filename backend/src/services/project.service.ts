import { findAllProjects, findPublishedProjectBySlug, findPublishedProjects } from '../repositories/project.repository'

export const getAllProjects = () => {
  return findAllProjects()
}

export const getPublishedProjects = () => findPublishedProjects()

export const getPublishedProject = (slug: string) => findPublishedProjectBySlug(slug)