import pg from 'pg'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Configure the hosted PostgreSQL connection before starting the CMS.')
}

export const database = new Pool({
  connectionString: databaseUrl,
  ssl: /^true$/i.test(process.env.DATABASE_SSL ?? '') ? { rejectUnauthorized: false } : undefined,
})
