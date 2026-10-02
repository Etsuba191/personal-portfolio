import { apiRequest } from './request'

export type ContactPayload = {
  name: string
  email: string
  message: string
}

export const submitContactMessage = async (payload: ContactPayload) => {
  return apiRequest('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
