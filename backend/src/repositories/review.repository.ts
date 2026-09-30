import { database } from '../config/database'
import type { Review, ReviewInput, ReviewStatus } from '../types/review'

const reviewColumns = '"id", "name", "role", "company", "photoUrl", "rating", "comment", "status", "createdAt", "updatedAt"'

const mapReview = (row: Record<string, unknown>): Review => ({
  id: Number(row.id),
  name: String(row.name),
  role: String(row.role),
  company: row.company ? String(row.company) : null,
  photoUrl: row.photoUrl ? String(row.photoUrl) : null,
  rating: Number(row.rating),
  comment: String(row.comment),
  status: String(row.status) as ReviewStatus,
  createdAt: new Date(String(row.createdAt)).toISOString(),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

export const findApprovedReviews = async () => {
  const result = await database.query(`SELECT ${reviewColumns} FROM "Review" WHERE "status" = 'APPROVED' ORDER BY "createdAt" DESC`)
  return result.rows.map(mapReview)
}

export const findAllReviews = async () => {
  const result = await database.query(`SELECT ${reviewColumns}, "email" FROM "Review" ORDER BY "createdAt" DESC`)
  return result.rows.map((row: Record<string, unknown>) => ({ ...mapReview(row), email: String(row.email) }))
}

export const createReview = async (input: ReviewInput, photoUrl: string | null) => {
  const result = await database.query(
    `INSERT INTO "Review" ("name", "email", "role", "company", "photoUrl", "rating", "comment")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${reviewColumns}`,
    [input.name, input.email, input.role, input.company || null, photoUrl, input.rating, input.comment],
  )
  return mapReview(result.rows[0])
}

export const updateReviewStatus = async (id: number, status: Exclude<ReviewStatus, 'PENDING'>) => {
  const result = await database.query(
    `UPDATE "Review" SET "status" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2 RETURNING ${reviewColumns}`,
    [status, id],
  )
  return result.rows[0] ? mapReview(result.rows[0]) : null
}

export const updateReview = async (id: number, input: { name: string; email: string; role: string; company: string | null; rating: number; comment: string; status: ReviewStatus }) => {
  const result = await database.query(
    `UPDATE "Review" SET "name" = $1, "email" = $2, "role" = $3, "company" = $4, "rating" = $5, "comment" = $6, "status" = $7, "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $8 RETURNING ${reviewColumns}`,
    [input.name, input.email, input.role, input.company, input.rating, input.comment, input.status, id],
  )
  return result.rows[0] ? mapReview(result.rows[0]) : null
}

export const deleteReview = async (id: number) => {
  const result = await database.query('DELETE FROM "Review" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}
