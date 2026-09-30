export type Project = {
  id: number
  title: string
  slug: string
  category: string
  shortDescription: string
  overview: string
  problem: string
  approach: string
  solution: string
  technologies: string[]
  keyFeatures: string[]
  result: string
  reflection: string
  projectType: string
  featured: boolean
  published: boolean
  githubUrl: string | null
  liveUrl: string | null
  videoUrl: string | null
  coverImage: string | null
  galleryImages: Array<{ id: number; url: string; cloudinaryId: string | null; alt: string | null; sortOrder: number }>
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Omit<Project, 'id' | 'galleryImages' | 'createdAt' | 'updatedAt' | 'published'> & {
  published?: boolean
}