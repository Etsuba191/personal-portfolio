import pg from 'pg'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Configure the hosted PostgreSQL connection before starting the CMS.')
}

const numberSetting = (name: string, fallback: number) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export const database = new Pool({
  connectionString: databaseUrl,
  ssl: /^true$/i.test(process.env.DATABASE_SSL ?? '') || /sslmode=require/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  max: numberSetting('DATABASE_POOL_MAX', 5),
  connectionTimeoutMillis: numberSetting('DATABASE_CONNECTION_TIMEOUT_MS', 5000),
  idleTimeoutMillis: numberSetting('DATABASE_IDLE_TIMEOUT_MS', 10000),
  query_timeout: numberSetting('DATABASE_QUERY_TIMEOUT_MS', 10000),
  statement_timeout: numberSetting('DATABASE_STATEMENT_TIMEOUT_MS', 10000),
})

database.on('error', (error) => {
  console.error('Database pool error', error)
})
