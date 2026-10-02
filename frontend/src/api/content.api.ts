import { apiRequest } from './request'

export type PublicContent = {
  about: { heading: string; paragraphs: string[]; profileImage: string | null; services: Array<{ number: string; icon: string; title: string; description: string }> } | null
  profile: { id: number; name: string | null; professionalTitle: string | null; shortIntroduction: string | null; location: string | null; email: string | null; phone: string | null; createdAt: string; updatedAt: string } | null
  socialLinks: Array<{ id: number; platform: string; label: string; url: string; sortOrder: number; updatedAt: string }>
  skills: Array<{ id: number; title: string; skills: string[]; sortOrder: number; updatedAt: string }>
  experience: Array<{ id: number; organization: string; role: string; division: string | null; startDate: string; endDate: string; description: string | null; sortOrder: number; updatedAt: string }>
  education: Array<{ id: number; institution: string; degree: string; startDate: string | null; endDate: string | null; description: string | null; sortOrder: number; updatedAt: string }>
  cv: { url: string; fileName: string; updatedAt: string } | null
  certificates: Array<{ id: number; title: string; issuer: string; issueDate: string | null; credentialUrl: string | null; fileUrl: string; fileName: string; sortOrder: number }>
  audio: { id: number; url: string; publicId: string | null; fileName: string; enabled: boolean; loop: boolean; volume: number; sortOrder: number; createdAt: string; updatedAt: string } | null
  tools: Array<{ id: number; name: string; iconUrl: string | null; iconPublicId: string | null; category: string | null; enabled: boolean; sortOrder: number; skillGroupId: number | null; createdAt: string; updatedAt: string }>
}

let pendingContentRequest: Promise<PublicContent> | null = null

export const getPublicContent = (): Promise<PublicContent> => {
  if (!pendingContentRequest) {
    pendingContentRequest = apiRequest<{ data: PublicContent; errors?: Record<string, string> }>('/content')
      .then((result) => result.data)
      .finally(() => { pendingContentRequest = null })
  }
  return pendingContentRequest
}
