import { database } from '../config/database'
import type { Project as CmsProject, ProjectInput } from '../types/project'

export type Project = {
  id: number
  title: string
  description: string
  technologies: string[]
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Electric Grid Dashboard',
    description: 'A dashboard for visualizing Ethiopian electric grid assets.',
    technologies: ['React', 'TypeScript', 'Leaflet'],
  },
  {
    id: 2,
    title: 'Hotel Management System',
    description: 'A full-stack hotel management system.',
    technologies: ['React', 'Node.js', 'Express', 'MySQL'],
  },
  {
    id: 3,
    title: 'Gibi Gubae Student Registration',
    description: 'A student registration system and community landing page for Haramaya University.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
  },
]

export const findAllProjects = (): Project[] => {
  return projects
}

const projectColumns = `
  p."id", p."title", p."slug", p."category", p."shortDescription", p."overview",
  p."problem", p."approach", p."solution", p."technologies", p."keyFeatures",
  p."result", p."reflection", p."projectType", p."featured", p."published",
  p."githubUrl", p."liveUrl", p."videoUrl", p."coverImage", p."createdAt", p."updatedAt"
`

const projectReturningColumns = `
  "id", "title", "slug", "category", "shortDescription", "overview",
  "problem", "approach", "solution", "technologies", "keyFeatures",
  "result", "reflection", "projectType", "featured", "published",
  "githubUrl", "liveUrl", "videoUrl", "coverImage", "createdAt", "updatedAt"
`

const mapProject = (row: Record<string, unknown>): CmsProject => ({
  id: Number(row.id),
  title: String(row.title),
  slug: String(row.slug),
  category: String(row.category),
  shortDescription: String(row.shortDescription),
  overview: String(row.overview),
  problem: String(row.problem),
  approach: String(row.approach),
  solution: String(row.solution),
  technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [],
  keyFeatures: Array.isArray(row.keyFeatures) ? row.keyFeatures.map(String) : [],
  result: String(row.result),
  reflection: String(row.reflection),
  projectType: String(row.projectType),
  featured: Boolean(row.featured),
  published: Boolean(row.published),
  githubUrl: row.githubUrl ? String(row.githubUrl) : null,
  liveUrl: row.liveUrl ? String(row.liveUrl) : null,
  videoUrl: row.videoUrl ? String(row.videoUrl) : null,
  coverImage: row.coverImage ? String(row.coverImage) : null,
  galleryImages: [],
  createdAt: new Date(String(row.createdAt)).toISOString(),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const withGallery = async (project: CmsProject): Promise<CmsProject> => {
  const result = await database.query(
    'SELECT "id", "url", "cloudinaryId", "alt", "sortOrder" FROM "ProjectImage" WHERE "projectId" = $1 ORDER BY "sortOrder", "id"',
    [project.id],
  )
  return { ...project, galleryImages: result.rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    url: String(row.url),
    cloudinaryId: row.cloudinaryId ? String(row.cloudinaryId) : null,
    alt: row.alt ? String(row.alt) : null,
    sortOrder: Number(row.sortOrder),
  })) }
}

export const findPublishedProjects = async (): Promise<CmsProject[]> => {
  const result = await database.query(`SELECT ${projectColumns} FROM "Project" p WHERE p."published" = true ORDER BY p."featured" DESC, p."updatedAt" DESC`)
  return Promise.all(result.rows.map((row: Record<string, unknown>) => withGallery(mapProject(row))))
}

export const findPublishedProjectBySlug = async (slug: string): Promise<CmsProject | null> => {
  const result = await database.query(`SELECT ${projectColumns} FROM "Project" p WHERE p."published" = true AND p."slug" = $1 LIMIT 1`, [slug])
  return result.rows[0] ? withGallery(mapProject(result.rows[0])) : null
}

export const findAllCmsProjects = async (): Promise<CmsProject[]> => {
  const result = await database.query(`SELECT ${projectColumns} FROM "Project" p ORDER BY p."updatedAt" DESC`)
  return Promise.all(result.rows.map((row: Record<string, unknown>) => withGallery(mapProject(row))))
}

const projectValues = (input: ProjectInput) => [
  input.title, input.slug, input.category, input.shortDescription, input.overview, input.problem,
  input.approach, input.solution, input.technologies, input.keyFeatures, input.result, input.reflection,
  input.projectType, input.featured, input.published ?? false, input.githubUrl, input.liveUrl, input.videoUrl, input.coverImage,
]

export const createCmsProject = async (input: ProjectInput) => {
  const result = await database.query(
    `INSERT INTO "Project" ("title", "slug", "category", "shortDescription", "overview", "problem", "approach", "solution", "technologies", "keyFeatures", "result", "reflection", "projectType", "featured", "published", "githubUrl", "liveUrl", "videoUrl", "coverImage", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING ${projectReturningColumns}`,
    projectValues(input),
  )
  return withGallery(mapProject(result.rows[0]))
}

export const updateCmsProject = async (id: number, input: ProjectInput) => {
  const result = await database.query(
    `UPDATE "Project" SET "title" = $1, "slug" = $2, "category" = $3, "shortDescription" = $4, "overview" = $5, "problem" = $6, "approach" = $7, "solution" = $8, "technologies" = $9, "keyFeatures" = $10, "result" = $11, "reflection" = $12, "projectType" = $13, "featured" = $14, "published" = $15, "githubUrl" = $16, "liveUrl" = $17, "videoUrl" = $18, "coverImage" = $19, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $20 RETURNING ${projectReturningColumns}`,
    [...projectValues(input), id],
  )
  return result.rows[0] ? withGallery(mapProject(result.rows[0])) : null
}

export const setProjectPublished = async (id: number, published: boolean) => {
  const result = await database.query(`UPDATE "Project" SET "published" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2 RETURNING ${projectReturningColumns}`, [published, id])
  return result.rows[0] ? withGallery(mapProject(result.rows[0])) : null
}

export const deleteCmsProject = async (id: number) => {
  const result = await database.query('DELETE FROM "Project" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const findProjectImages = async (projectId: number) => {
  const result = await database.query('SELECT "cloudinaryId" FROM "ProjectImage" WHERE "projectId" = $1', [projectId])
  return result.rows.map((row: Record<string, unknown>) => String(row.cloudinaryId)).filter(Boolean)
}

export const addProjectImage = async (projectId: number, url: string, cloudinaryId: string, alt: string | null) => {
  const result = await database.query(
    `INSERT INTO "ProjectImage" ("projectId", "url", "cloudinaryId", "alt", "sortOrder")
     VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX("sortOrder") + 1 FROM "ProjectImage" WHERE "projectId" = $1), 0))
     RETURNING "id", "url", "cloudinaryId", "alt", "sortOrder"`,
    [projectId, url, cloudinaryId, alt],
  )
  return result.rows[0] ?? null
}

export const findProjectImage = async (projectId: number, imageId: number) => {
  const result = await database.query('SELECT "id", "url", "cloudinaryId" FROM "ProjectImage" WHERE "projectId" = $1 AND "id" = $2', [projectId, imageId])
  return result.rows[0] ?? null
}

export const deleteProjectImage = async (projectId: number, imageId: number) => {
  const result = await database.query('DELETE FROM "ProjectImage" WHERE "projectId" = $1 AND "id" = $2 RETURNING "id"', [projectId, imageId])
  return result.rowCount === 1
}

export const reorderProjectImages = async (projectId: number, imageIds: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, imageId] of imageIds.entries()) {
      await client.query('UPDATE "ProjectImage" SET "sortOrder" = $1 WHERE "projectId" = $2 AND "id" = $3', [sortOrder, projectId, imageId])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}