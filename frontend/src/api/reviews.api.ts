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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const getApprovedReviews = async (): Promise<PublicReview[]> => {
  const response = await fetch(`${API_URL}/reviews`)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message ?? 'Unable to load testimonials.')
  }

  return result.data
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

  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message ?? 'Unable to submit your review.')
  }

  return result
}
