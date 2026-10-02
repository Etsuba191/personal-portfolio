export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 12000

export const apiRequest = async <T = unknown>(path: string, options: RequestInit = {}, credentials = false): Promise<T> => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: credentials ? 'include' : options.credentials,
      signal: controller.signal,
    })
    const result = response.status === 204 ? null : await response.json().catch(() => null)
    const message = typeof result === 'object' && result !== null && 'message' in result && typeof result.message === 'string'
      ? result.message
      : 'The server could not complete the request.'
    if (!response.ok) throw new Error(message)
    return result as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The server/database is taking too long to respond. Please try again.', { cause: error })
    }
    if (error instanceof TypeError) throw new Error('Unable to reach the server. Check your connection and try again.', { cause: error })
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
