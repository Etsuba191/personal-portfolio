import { apiRequest } from './request'

export type AdminReview = {
  id: number
  name: string
  email: string
  role: string
  company: string | null
  photoUrl: string | null
  rating: number
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export type CmsProject = {
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

export type CmsProjectInput = Omit<CmsProject, 'id' | 'published' | 'galleryImages' | 'createdAt' | 'updatedAt'> & { published: boolean }
export type SkillGroupInput = { id?: number; title: string; skills: string[]; sortOrder?: number }
export type ExperienceInput = { id?: number; organization: string; role: string; division?: string | null; startDate: string; endDate: string; description?: string | null; sortOrder?: number }
export type EducationInput = { id?: number; institution: string; degree: string; startDate?: string | null; endDate?: string | null; description?: string | null; sortOrder?: number }
export type SocialLinkInput = { id?: number; platform: 'github' | 'linkedin' | 'telegram' | 'instagram'; label: string; url: string; sortOrder?: number }
export type ServiceInput = { number: string; icon: string; title: string; description: string }
export type CertificateInput = { id?: number; title: string; issuer: string; issueDate?: string | null; credentialUrl?: string | null; fileUrl?: string; fileName?: string; sortOrder?: number }

export type AudioInput = { id?: number; url?: string; publicId?: string | null; fileName?: string; enabled?: boolean; loop?: boolean; volume?: number; sortOrder?: number }
export type ToolInput = { id?: number; name: string; iconUrl?: string | null; iconPublicId?: string | null; category?: string | null; enabled?: boolean; sortOrder?: number; skillGroupId?: number | null }

type ApiResponse<T> = { data: T }

const request = async <T = unknown>(path: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  return apiRequest<ApiResponse<T>>(path, options, true)
}

export const loginAdmin = (email: string, password: string) => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
export const logoutAdmin = () => request('/auth/logout', { method: 'POST' })
export const getAdminSession = () => request('/auth/session')

export const getAdminReviews = async (): Promise<AdminReview[]> => (await request<AdminReview[]>('/reviews/admin')).data
export const updateReviewStatus = (id: number, status: 'approve' | 'reject') => request(`/reviews/${id}/${status}`, { method: 'PATCH' })
export const updateAdminReview = (id: number, review: Omit<AdminReview, 'id' | 'createdAt' | 'updatedAt' | 'photoUrl'>) => request<AdminReview>(`/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) })
export const deleteReview = (id: number) => request(`/reviews/${id}`, { method: 'DELETE' })

export const getAdminProjects = async (): Promise<CmsProject[]> => (await request<CmsProject[]>('/admin/projects')).data
export const createAdminProject = (project: CmsProjectInput) => request('/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) })
export const updateAdminProject = (id: number, project: CmsProjectInput) => request(`/admin/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) })
export const updateAdminProjectPublication = (id: number, published: boolean) => request(`/admin/projects/${id}/publication`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published }) })
export const deleteAdminProject = (id: number) => request(`/admin/projects/${id}`, { method: 'DELETE' })
export const uploadAdminProjectImage = async (projectId: number, file: File, alt: string) => { const body = new FormData(); body.append('image', file); body.append('alt', alt); return (await request<CmsProject['galleryImages'][number]>(`/admin/projects/${projectId}/images`, { method: 'POST', body })).data }
export const deleteAdminProjectImage = (projectId: number, imageId: number) => request(`/admin/projects/${projectId}/images/${imageId}`, { method: 'DELETE' })
export const reorderAdminProjectImages = (projectId: number, imageIds: number[]) => request(`/admin/projects/${projectId}/images/reorder`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageIds }) })

export type AdminContent = {
  about: { heading: string; paragraphs: string[]; profileImage: string | null; services: ServiceInput[] } | null
  profile: { id: number; name: string | null; professionalTitle: string | null; shortIntroduction: string | null; location: string | null; email: string | null; phone: string | null; createdAt: string; updatedAt: string } | null
  socialLinks: SocialLinkInput[]
  skills: SkillGroupInput[]
  experience: ExperienceInput[]
  education: EducationInput[]
  certificates: CertificateInput[]
}

export const getAdminContent = async (): Promise<AdminContent> => (await request<AdminContent>('/admin/content')).data
export const saveAdminContent = (content: { about: { heading: string; paragraphs: string[] }; skills: SkillGroupInput[]; experience: ExperienceInput[]; services: ServiceInput[] }) => request('/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) })
export const getAdminProfile = async () => (await request<AdminContent['profile']>('/admin/content/profile')).data
export const saveAdminProfile = (profile: { name?: string | null; professionalTitle?: string | null; shortIntroduction?: string | null; location?: string | null; email?: string | null; phone?: string | null }) => request('/admin/content/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
export const saveAdminAbout = (about: { heading: string; paragraphs: string[] }) => request('/admin/content/about', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(about) })
export const createAdminSocialLink = (link: SocialLinkInput) => request<SocialLinkInput>('/admin/content/social-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(link) }).then(r => r.data)
export const updateAdminSocialLink = (id: number, link: SocialLinkInput) => request<SocialLinkInput>(`/admin/content/social-links/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(link) }).then(r => r.data)
export const reorderAdminSocialLinks = (ids: number[]) => request('/admin/content/social-links/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminSocialLink = (id: number) => request(`/admin/content/social-links/${id}`, { method: 'DELETE' })
export const getAdminEducation = async (): Promise<EducationInput[]> => (await request<EducationInput[]>('/admin/content/education')).data
export const createAdminEducation = (entry: EducationInput) => request<EducationInput>('/admin/content/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).then(r => r.data)
export const updateAdminEducation = (id: number, entry: EducationInput) => request<EducationInput>(`/admin/content/education/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).then(r => r.data)
export const reorderAdminEducation = (ids: number[]) => request('/admin/content/education/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminEducation = (id: number) => request(`/admin/content/education/${id}`, { method: 'DELETE' })
export const getAdminSkills = async (): Promise<SkillGroupInput[]> => (await request<SkillGroupInput[]>('/admin/content/skills')).data
export const createAdminSkill = (group: SkillGroupInput) => request<SkillGroupInput>('/admin/content/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(group) }).then(r => r.data)
export const updateAdminSkill = (id: number, group: SkillGroupInput) => request<SkillGroupInput>(`/admin/content/skills/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(group) }).then(r => r.data)
export const reorderAdminSkills = (ids: number[]) => request('/admin/content/skills/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminSkill = (id: number) => request(`/admin/content/skills/${id}`, { method: 'DELETE' })
export const getAdminExperience = async (): Promise<ExperienceInput[]> => (await request<ExperienceInput[]>('/admin/content/experience')).data
export const createAdminExperience = (item: ExperienceInput) => request<ExperienceInput>('/admin/content/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then(r => r.data)
export const updateAdminExperience = (id: number, item: ExperienceInput) => request<ExperienceInput>(`/admin/content/experience/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then(r => r.data)
export const reorderAdminExperience = (ids: number[]) => request('/admin/content/experience/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminExperience = (id: number) => request(`/admin/content/experience/${id}`, { method: 'DELETE' })
export const getAdminServices = async (): Promise<ServiceInput[]> => (await request<ServiceInput[]>('/admin/content/services')).data
export const saveAdminServices = (services: ServiceInput[]) => request<ServiceInput[]>('/admin/content/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ services }) }).then(r => r.data)
export const getAdminCertificates = async (): Promise<CertificateInput[]> => (await request<CertificateInput[]>('/admin/content/certificates')).data
export const createAdminCertificate = async (metadata: { title: string; issuer: string; issueDate: string; credentialUrl: string }, file: File) => { const body = new FormData(); body.append('title', metadata.title); body.append('issuer', metadata.issuer); body.append('issueDate', metadata.issueDate); body.append('credentialUrl', metadata.credentialUrl); body.append('certificate', file); return (await request<CertificateInput>('/admin/content/certificates', { method: 'POST', body })).data }
export const updateAdminCertificate = (id: number, certificate: CertificateInput) => request<CertificateInput>(`/admin/content/certificates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(certificate) })
export const replaceAdminCertificateFile = async (id: number, file: File) => { const body = new FormData(); body.append('certificate', file); return request<CertificateInput>(`/admin/content/certificates/${id}/file`, { method: 'PATCH', body }) }
export const reorderAdminCertificates = (ids: number[]) => request('/admin/content/certificates/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminCertificate = (id: number) => request(`/admin/content/certificates/${id}`, { method: 'DELETE' })
export const uploadAdminCv = async (file: File) => { const body = new FormData(); body.append('cv', file); return (await request<{ url: string; fileName: string } >('/admin/content/cv', { method: 'POST', body })).data }
export const uploadAdminProfileImage = async (file: File) => { const body = new FormData(); body.append('image', file); return (await request<{ profileImage: string }>('/admin/content/profile-image', { method: 'POST', body })).data }

export const getAdminAudio = async (): Promise<AudioInput[]> => (await request<AudioInput[]>('/admin/content/audio')).data
export const createAdminAudio = async (file: File, metadata: { enabled?: boolean; loop?: boolean; volume?: number; sortOrder?: number }) => {
  const body = new FormData()
  body.append('audio', file)
  if (metadata.enabled !== undefined) body.append('enabled', String(metadata.enabled))
  if (metadata.loop !== undefined) body.append('loop', String(metadata.loop))
  if (metadata.volume !== undefined) body.append('volume', String(metadata.volume))
  if (metadata.sortOrder !== undefined) body.append('sortOrder', String(metadata.sortOrder))
  return (await request<AudioInput>('/admin/content/audio', { method: 'POST', body })).data
}
export const updateAdminAudio = async (id: number, metadata: { enabled?: boolean; loop?: boolean; volume?: number; sortOrder?: number; fileName?: string }, file?: File) => {
  const body = new FormData()
  if (file) body.append('audio', file)
  if (metadata.enabled !== undefined) body.append('enabled', String(metadata.enabled))
  if (metadata.loop !== undefined) body.append('loop', String(metadata.loop))
  if (metadata.volume !== undefined) body.append('volume', String(metadata.volume))
  if (metadata.sortOrder !== undefined) body.append('sortOrder', String(metadata.sortOrder))
  if (metadata.fileName !== undefined) body.append('fileName', metadata.fileName)
  return (await request<AudioInput>(`/admin/content/audio/${id}`, { method: 'PATCH', body })).data
}
export const deleteAdminAudio = (id: number) => request(`/admin/content/audio/${id}`, { method: 'DELETE' })

export const getAdminTools = async (): Promise<ToolInput[]> => (await request<ToolInput[]>('/admin/content/tools')).data
export const createAdminTool = async (tool: ToolInput, file?: File) => {
  const body = new FormData()
  body.append('name', tool.name)
  if (tool.iconUrl) body.append('iconUrl', tool.iconUrl)
  if (tool.iconPublicId) body.append('iconPublicId', tool.iconPublicId)
  if (tool.category) body.append('category', tool.category)
  if (tool.enabled !== undefined) body.append('enabled', String(tool.enabled))
  if (tool.sortOrder !== undefined) body.append('sortOrder', String(tool.sortOrder))
  if (tool.skillGroupId !== undefined && tool.skillGroupId !== null) body.append('skillGroupId', String(tool.skillGroupId))
  if (file) body.append('icon', file)
  return (await request<ToolInput>('/admin/content/tools', { method: 'POST', body })).data
}
export const updateAdminTool = async (id: number, tool: Partial<ToolInput>, file?: File) => {
  const body = new FormData()
  if (tool.name !== undefined) body.append('name', tool.name)
  if (tool.iconUrl !== undefined && tool.iconUrl !== null) body.append('iconUrl', tool.iconUrl)
  if (tool.iconPublicId !== undefined && tool.iconPublicId !== null) body.append('iconPublicId', tool.iconPublicId)
  if (tool.category !== undefined && tool.category !== null) body.append('category', tool.category)
  if (tool.enabled !== undefined) body.append('enabled', String(tool.enabled))
  if (tool.sortOrder !== undefined) body.append('sortOrder', String(tool.sortOrder))
  if (tool.skillGroupId !== undefined && tool.skillGroupId !== null) body.append('skillGroupId', String(tool.skillGroupId))
  if (file) body.append('icon', file)
  return (await request<ToolInput>(`/admin/content/tools/${id}`, { method: 'PATCH', body })).data
}
export const reorderAdminTools = (ids: number[]) => request('/admin/content/tools/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
export const deleteAdminTool = (id: number) => request(`/admin/content/tools/${id}`, { method: 'DELETE' })
