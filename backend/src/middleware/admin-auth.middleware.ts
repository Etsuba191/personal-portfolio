import type { NextFunction, Request, Response } from 'express'
import { getSessionCookieName, readAdminSession } from '../services/auth.service'

const readCookie = (header: string | undefined, name: string) => {
  const value = header?.split(';').find((part) => part.trim().startsWith(`${name}=`))
  return value ? decodeURIComponent(value.trim().slice(name.length + 1)) : undefined
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readCookie(req.header('cookie'), getSessionCookieName())
    if (!readAdminSession(token)) {
      res.status(401).json({ success: false, message: 'Admin authentication required.' })
      return
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Admin authentication required.' })
  }
}
