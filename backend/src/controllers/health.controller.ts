import { Request, Response } from 'express'
import { getHealthStatus } from '../services/health.service'

export const getHealth = async (_req: Request, res: Response) => {
  const health = await getHealthStatus()
  res.status(health.success ? 200 : 503).json(health)
}