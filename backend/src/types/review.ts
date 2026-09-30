export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type Review = {
  id: number
  name: string
  role: string
  company: string | null
  photoUrl: string | null
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export type ReviewInput = {
  name: string
  email: string
  role: string
  company?: string
  rating: number
  comment: string
  photo?: Express.Multer.File
}
