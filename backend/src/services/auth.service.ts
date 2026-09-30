import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const sessionCookie = 'portfolio_admin_session'
const sessionLifetimeSeconds = 60 * 60 * 8

type SessionPayload = {
  email: string
  expiresAt: number
}

const getAdminEmail = () => process.env.ADMIN_EMAIL?.trim().toLowerCase()
const getSessionSecret = () => process.env.SESSION_SECRET

const sign = (value: string) => {
  const secret = getSessionSecret()
  if (!secret) throw new Error('Admin session is not configured.')
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export const verifyAdminPassword = (email: string, password: string) => {
  const adminEmail = getAdminEmail()
  if (!adminEmail || email.trim().toLowerCase() !== adminEmail) return false

  const configuredHash = process.env.ADMIN_PASSWORD_HASH
  if (configuredHash) {
    const [salt, expectedHash] = configuredHash.split(':')
    if (!salt || !expectedHash) return false
    const actualHash = scryptSync(password, salt, 64).toString('hex')
    const expectedBuffer = Buffer.from(expectedHash, 'hex')
    const actualBuffer = Buffer.from(actualHash, 'hex')
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
  }

  const configuredPassword = process.env.ADMIN_PASSWORD
  return Boolean(configuredPassword && timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword)))
}

export const createAdminSession = (email: string) => {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export const readAdminSession = (token: string | undefined) => {
  if (!token) return null
  const [encodedPayload, providedSignature] = token.split('.')
  if (!encodedPayload || !providedSignature) return null

  const expectedSignature = sign(encodedPayload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const providedBuffer = Buffer.from(providedSignature)
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload
    return payload.expiresAt > Math.floor(Date.now() / 1000) ? payload : null
  } catch {
    return null
  }
}

export const getSessionCookieName = () => sessionCookie
export const getSessionLifetimeSeconds = () => sessionLifetimeSeconds
export const generatePasswordHash = (password: string) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
