import { apiRequest } from './request'

export type PublicReview = {
  id: number
  name: string
  role: string
  company: string | null
  photoUrl: string | null
  rating: number
  comment: string
  createdAt: string
}

export type ReviewPayload = {
  name: string
  email: string
  role: string
  company: string
  rating: number
  comment: string
  photo?: File
}

export const getApprovedReviews = async (): Promise<PublicReview[]> => {
  return (await apiRequest<{ data: PublicReview[] }>('/reviews')).data
}

export const submitReview = async (payload: ReviewPayload) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('email', payload.email)
  formData.append('role', payload.role)
  formData.append('company', payload.company)
  formData.append('rating', String(payload.rating))
  formData.append('comment', payload.comment)
  if (payload.photo) formData.append('photo', payload.photo)

  return apiRequest('/reviews', {
    method: 'POST',
    body: formData,
  })
}
