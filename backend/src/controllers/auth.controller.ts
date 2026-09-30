import type { Request, Response } from 'express'
import {
  createAdminSession,
  getSessionCookieName,
  getSessionLifetimeSeconds,
  readAdminSession,
  verifyAdminPassword,
} from '../services/auth.service'

const getCookie = (req: Request) => req.header('cookie')?.split(';').find((part) => part.trim().startsWith(`${getSessionCookieName()}=`))?.trim().slice(getSessionCookieName().length + 1)

export const login = (req: Request, res: Response) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!verifyAdminPassword(email, password)) {
    res.status(401).json({ success: false, message: 'Invalid admin credentials.' })
    return
  }

  const token = createAdminSession(email)
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = isProduction ? '; Secure' : ''
  const sameSite = isProduction ? '; SameSite=None' : '; SameSite=Lax'
  res.setHeader('Set-Cookie', `${getSessionCookieName()}=${encodeURIComponent(token)}; HttpOnly${sameSite}; Path=/; Max-Age=${getSessionLifetimeSeconds()}${isProduction ? '; Secure' : ''}`)
  res.json({ success: true, data: { email: email.trim().toLowerCase() } })
}

export const logout = (_req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sameSite = isProduction ? '; SameSite=None' : '; SameSite=Lax'
  res.setHeader('Set-Cookie', `${getSessionCookieName()}=; HttpOnly${sameSite}; Path=/; Max-Age=0${isProduction ? '; Secure' : ''}`)
  res.status(204).send()
}

export const session = (req: Request, res: Response) => {
  const token = getCookie(req)
  const currentSession = readAdminSession(token)
  if (!currentSession) {
    res.status(401).json({ success: false, message: 'Admin authentication required.' })
    return
  }
  res.json({ success: true, data: { email: currentSession.email } })
}
