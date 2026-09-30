export type AboutContent = {
  heading: string
  paragraphs: string[]
  profileImage: string | null
  services: Service[]
}

export type Profile = {
  id: number
  name: string | null
  professionalTitle: string | null
  shortIntroduction: string | null
  location: string | null
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export type SocialLink = {
  id: number
  platform: string
  label: string
  url: string
  sortOrder: number
  updatedAt: string
}

export type Education = {
  id: number
  institution: string
  degree: string
  startDate: string | null
  endDate: string | null
  description: string | null
  sortOrder: number
  updatedAt: string
}

export type Service = {
  number: string
  icon: string
  title: string
  description: string
}

export type SkillGroup = {
  id: number
  title: string
  skills: string[]
  sortOrder: number
  updatedAt: string
}

export type Experience = {
  id: number
  organization: string
  role: string
  division: string | null
  startDate: string
  endDate: string
  description: string | null
  sortOrder: number
  updatedAt: string
}

export type CvDocument = {
  url: string
  fileName: string
  updatedAt: string
}

export type Certificate = {
  id: number
  title: string
  issuer: string
  issueDate: string | null
  credentialUrl: string | null
  fileUrl: string
  fileName: string
  sortOrder: number
}

export type Audio = {
  id: number
  url: string
  publicId: string | null
  fileName: string
  enabled: boolean
  loop: boolean
  volume: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Tool = {
  id: number
  name: string
  iconUrl: string | null
  iconPublicId: string | null
  category: string | null
  enabled: boolean
  sortOrder: number
  skillGroupId: number | null
  createdAt: string
  updatedAt: string
}

export type EducationInput = Omit<Education, 'id' | 'sortOrder' | 'updatedAt'> & { sortOrder?: number }
export type SocialLinkInput = Omit<SocialLink, 'id' | 'sortOrder' | 'updatedAt'> & { sortOrder?: number }
export type ProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>

export type AudioInput = Omit<Audio, 'id' | 'createdAt' | 'updatedAt'> & { sortOrder?: number }
export type ToolInput = Omit<Tool, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'> & { sortOrder?: number }
