import { database } from '../config/database'

export const getHealthStatus = async () => {
  try {
    await database.query('SELECT 1')
    return { success: true, status: 'ok', database: 'ok' as const }
  } catch (error) {
    console.error('Health database check failed', error)
    return { success: false, status: 'degraded', database: 'unavailable' as const }
  }
}