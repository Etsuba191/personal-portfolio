import type { NextFunction, Request, Response } from 'express'

export const requireReviewAdmin = (req: Request, res: Response, next: NextFunction) => {
  const configuredToken = process.env.REVIEW_ADMIN_TOKEN
  const providedToken = req.header('x-review-admin-token') ?? req.header('authorization')?.replace(/^Bearer\s+/i, '')

  if (!configuredToken || !providedToken || providedToken !== configuredToken) {
    res.status(401).json({ success: false, message: 'Admin authentication required.' })
    return
  }

  next()
}
