export type ContactPayload = {
  name: string
  email: string
  message: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const submitContactMessage = async (payload: ContactPayload) => {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message ?? 'Unable to send your message.')
  }

  return result
}
