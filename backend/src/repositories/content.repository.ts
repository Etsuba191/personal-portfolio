import { database } from '../config/database'
import type {
  AboutContent,
  Audio,
  AudioInput,
  Certificate,
  CvDocument,
  Education,
  EducationInput,
  Experience,
  Profile,
  ProfileInput,
  Service,
  SkillGroup,
  SocialLink,
  SocialLinkInput,
  Tool,
  ToolInput,
} from '../types/content'

type ResourceType = 'raw' | 'image'

type SkillGroupInput = Omit<SkillGroup, 'id' | 'sortOrder' | 'updatedAt'> & { sortOrder?: number }
type ExperienceInput = Omit<Experience, 'id' | 'sortOrder' | 'updatedAt'> & { sortOrder?: number }

type CertificateInput = {
  title: string
  issuer: string
  issueDate: string | null
  credentialUrl: string | null
  fileUrl: string
  publicId: string
  resourceType: ResourceType
  fileName: string
}

type CertificateUpdateInput = {
  title: string
  issuer: string
  issueDate: string | null
  credentialUrl: string | null
  fileName?: string | null
}

type CreateAudioInput = Omit<AudioInput, 'sortOrder'> & { sortOrder?: number }

type CreateToolInput = Omit<ToolInput, 'iconUrl' | 'iconPublicId' | 'skillGroupId' | 'sortOrder'> & {
  iconUrl?: string | null
  iconPublicId?: string | null
  skillGroupId?: number | null
  sortOrder?: number
}

const mapAbout = (row: Record<string, unknown>): AboutContent => ({
  heading: String(row.heading),
  paragraphs: Array.isArray(row.paragraphs) ? row.paragraphs.map(String) : [],
  profileImage: row.profileImage ? String(row.profileImage) : null,
  services: Array.isArray(row.services) ? (row.services as Service[]) : [],
})

const mapProfile = (row: Record<string, unknown>): Profile => ({
  id: Number(row.id),
  name: row.name ? String(row.name) : null,
  professionalTitle: row.professionalTitle ? String(row.professionalTitle) : null,
  shortIntroduction: row.shortIntroduction ? String(row.shortIntroduction) : null,
  location: row.location ? String(row.location) : null,
  email: row.email ? String(row.email) : null,
  phone: row.phone ? String(row.phone) : null,
  createdAt: new Date(String(row.createdAt)).toISOString(),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapSocialLink = (row: Record<string, unknown>): SocialLink => ({
  id: Number(row.id),
  platform: String(row.platform),
  label: String(row.label),
  url: String(row.url),
  sortOrder: Number(row.sortOrder),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapEducation = (row: Record<string, unknown>): Education => ({
  id: Number(row.id),
  institution: String(row.institution),
  degree: String(row.degree),
  startDate: row.startDate ? String(row.startDate) : null,
  endDate: row.endDate ? String(row.endDate) : null,
  description: row.description ? String(row.description) : null,
  sortOrder: Number(row.sortOrder),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapSkillGroup = (row: Record<string, unknown>): SkillGroup => ({
  id: Number(row.id),
  title: String(row.title),
  skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
  sortOrder: Number(row.sortOrder),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapExperience = (row: Record<string, unknown>): Experience => ({
  id: Number(row.id),
  organization: String(row.organization),
  role: String(row.role),
  division: row.division ? String(row.division) : null,
  startDate: String(row.startDate),
  endDate: String(row.endDate),
  description: row.description ? String(row.description) : null,
  sortOrder: Number(row.sortOrder),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapCertificate = (row: Record<string, unknown>): Certificate => ({
  id: Number(row.id),
  title: String(row.title),
  issuer: String(row.issuer),
  issueDate: row.issueDate ? String(row.issueDate) : null,
  credentialUrl: row.credentialUrl ? String(row.credentialUrl) : null,
  fileUrl: String(row.fileUrl),
  fileName: String(row.fileName),
  sortOrder: Number(row.sortOrder),
})

const mapAudio = (row: Record<string, unknown>): Audio => ({
  id: Number(row.id),
  url: String(row.url),
  publicId: row.publicId ? String(row.publicId) : null,
  fileName: String(row.fileName),
  enabled: Boolean(row.enabled),
  loop: Boolean(row.loop),
  volume: Number(row.volume),
  sortOrder: Number(row.sortOrder),
  createdAt: new Date(String(row.createdAt)).toISOString(),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

const mapTool = (row: Record<string, unknown>): Tool => ({
  id: Number(row.id),
  name: String(row.name),
  iconUrl: row.iconUrl ? String(row.iconUrl) : null,
  iconPublicId: row.iconPublicId ? String(row.iconPublicId) : null,
  category: row.category ? String(row.category) : null,
  enabled: Boolean(row.enabled),
  sortOrder: Number(row.sortOrder),
  skillGroupId: row.skillGroupId ? Number(row.skillGroupId) : null,
  createdAt: new Date(String(row.createdAt)).toISOString(),
  updatedAt: new Date(String(row.updatedAt)).toISOString(),
})

export const findAboutContent = async (): Promise<AboutContent | null> => {
  const result = await database.query('SELECT "heading", "paragraphs", "profileImage", "services" FROM "AboutContent" WHERE "id" = 1')
  return result.rows[0] ? mapAbout(result.rows[0]) : null
}

export const findProfile = async (): Promise<Profile | null> => {
  const result = await database.query('SELECT "id", "name", "professionalTitle", "shortIntroduction", "location", "email", "phone", "createdAt", "updatedAt" FROM "Profile" WHERE "id" = 1')
  return result.rows[0] ? mapProfile(result.rows[0]) : null
}

export const saveProfile = async (input: ProfileInput) => {
  const result = await database.query(
    `INSERT INTO "Profile" ("id", "name", "professionalTitle", "shortIntroduction", "location", "email", "phone", "createdAt", "updatedAt")
     VALUES (1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT ("id") DO UPDATE SET
       "name" = $1, "professionalTitle" = $2, "shortIntroduction" = $3, "location" = $4, "email" = $5, "phone" = $6, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING "id", "name", "professionalTitle", "shortIntroduction", "location", "email", "phone", "createdAt", "updatedAt"`,
    [input.name || null, input.professionalTitle || null, input.shortIntroduction || null, input.location || null, input.email || null, input.phone || null],
  )
  return mapProfile(result.rows[0])
}

export const findSocialLinks = async (): Promise<SocialLink[]> => {
  const result = await database.query('SELECT "id", "platform", "label", "url", "sortOrder", "updatedAt" FROM "SocialLink" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapSocialLink)
}

export const createSocialLink = async (input: SocialLinkInput) => {
  const result = await database.query(
    `INSERT INTO "SocialLink" ("platform", "label", "url", "sortOrder")
     VALUES ($1, $2, $3, COALESCE($4, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "SocialLink")))
     RETURNING "id", "platform", "label", "url", "sortOrder", "updatedAt"`,
    [input.platform, input.label, input.url, input.sortOrder ?? null],
  )
  return mapSocialLink(result.rows[0])
}

export const findSocialLink = async (id: number): Promise<SocialLink | null> => {
  const result = await database.query('SELECT "id", "platform", "label", "url", "sortOrder", "updatedAt" FROM "SocialLink" WHERE "id" = $1', [id])
  return result.rows[0] ? mapSocialLink(result.rows[0]) : null
}

export const updateSocialLink = async (id: number, input: SocialLinkInput) => {
  const result = await database.query(
    `UPDATE "SocialLink" SET "platform" = $1, "label" = $2, "url" = $3, "sortOrder" = COALESCE($4, "sortOrder"), "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $5 RETURNING "id", "platform", "label", "url", "sortOrder", "updatedAt"`,
    [input.platform, input.label, input.url, input.sortOrder ?? null, id],
  )
  return result.rows[0] ? mapSocialLink(result.rows[0]) : null
}

export const deleteSocialLink = async (id: number) => {
  const result = await database.query('DELETE FROM "SocialLink" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderSocialLinks = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "SocialLink" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const findEducation = async (): Promise<Education[]> => {
  const result = await database.query('SELECT "id", "institution", "degree", "startDate", "endDate", "description", "sortOrder", "updatedAt" FROM "Education" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapEducation)
}

export const createEducation = async (input: EducationInput) => {
  const result = await database.query(
    `INSERT INTO "Education"
("institution", "degree", "startDate", "endDate", "description", "sortOrder", "updatedAt")
VALUES (
  $1, $2, $3, $4, $5,
  COALESCE($6, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "Education")),
  CURRENT_TIMESTAMP
)
RETURNING "id", "institution", "degree", "startDate", "endDate", "description", "sortOrder", "updatedAt"`,
    [input.institution, input.degree, input.startDate || null, input.endDate || null, input.description || null, input.sortOrder ?? null],
  )
  return mapEducation(result.rows[0])
}

export const findEducationEntry = async (id: number): Promise<Education | null> => {
  const result = await database.query('SELECT "id", "institution", "degree", "startDate", "endDate", "description", "sortOrder", "updatedAt" FROM "Education" WHERE "id" = $1', [id])
  return result.rows[0] ? mapEducation(result.rows[0]) : null
}

export const updateEducation = async (id: number, input: EducationInput) => {
  const result = await database.query(
    `UPDATE "Education" SET "institution" = $1, "degree" = $2, "startDate" = $3, "endDate" = $4, "description" = $5, "sortOrder" = COALESCE($6, "sortOrder"), "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $7 RETURNING "id", "institution", "degree", "startDate", "endDate", "description", "sortOrder", "updatedAt"`,
    [input.institution, input.degree, input.startDate || null, input.endDate || null, input.description || null, input.sortOrder ?? null, id],
  )
  return result.rows[0] ? mapEducation(result.rows[0]) : null
}

export const deleteEducation = async (id: number) => {
  const result = await database.query('DELETE FROM "Education" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderEducation = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "Education" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const findSkillGroups = async (): Promise<SkillGroup[]> => {
  const result = await database.query('SELECT "id", "title", "skills", "sortOrder", "updatedAt" FROM "SkillGroup" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapSkillGroup)
}

export const createSkillGroup = async (input: SkillGroupInput) => {
  const result = await database.query(
    `INSERT INTO "SkillGroup" ("title", "skills", "sortOrder")
     VALUES ($1, $2, COALESCE($3, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "SkillGroup")))
     RETURNING "id", "title", "skills", "sortOrder", "updatedAt"`,
    [input.title, input.skills, input.sortOrder ?? null],
  )
  return mapSkillGroup(result.rows[0])
}

export const findSkillGroup = async (id: number): Promise<SkillGroup | null> => {
  const result = await database.query('SELECT "id", "title", "skills", "sortOrder", "updatedAt" FROM "SkillGroup" WHERE "id" = $1', [id])
  return result.rows[0] ? mapSkillGroup(result.rows[0]) : null
}

export const updateSkillGroup = async (id: number, input: SkillGroupInput) => {
  const result = await database.query(
    `UPDATE "SkillGroup" SET "title" = $1, "skills" = $2, "sortOrder" = COALESCE($3, "sortOrder"), "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $4 RETURNING "id", "title", "skills", "sortOrder", "updatedAt"`,
    [input.title, input.skills, input.sortOrder ?? null, id],
  )
  return result.rows[0] ? mapSkillGroup(result.rows[0]) : null
}

export const deleteSkillGroup = async (id: number) => {
  const result = await database.query('DELETE FROM "SkillGroup" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderSkillGroups = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "SkillGroup" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const findExperiences = async (): Promise<Experience[]> => {
  const result = await database.query('SELECT "id", "organization", "role", "division", "startDate", "endDate", "description", "sortOrder", "updatedAt" FROM "Experience" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapExperience)
}

export const createExperience = async (input: ExperienceInput) => {
  const result = await database.query(
    `INSERT INTO "Experience"
("organization", "role", "division", "startDate", "endDate", "description", "sortOrder", "updatedAt")
VALUES (
  $1, $2, $3, $4, $5, $6,
  COALESCE($7, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "Experience")),
  CURRENT_TIMESTAMP
)
RETURNING "id", "organization", "role", "division", "startDate", "endDate", "description", "sortOrder", "updatedAt"`,
    [input.organization, input.role, input.division, input.startDate, input.endDate, input.description, input.sortOrder ?? null],
  )
  return mapExperience(result.rows[0])
}

export const findExperience = async (id: number): Promise<Experience | null> => {
  const result = await database.query('SELECT "id", "organization", "role", "division", "startDate", "endDate", "description", "sortOrder", "updatedAt" FROM "Experience" WHERE "id" = $1', [id])
  return result.rows[0] ? mapExperience(result.rows[0]) : null
}

export const updateExperience = async (id: number, input: ExperienceInput) => {
  const result = await database.query(
    `UPDATE "Experience"
SET
  "organization" = $1,
  "role" = $2,
  "division" = $3,
  "startDate" = $4,
  "endDate" = $5,
  "description" = $6,
  "sortOrder" = COALESCE($7, "sortOrder"),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = $8
RETURNING "id", "organization", "role", "division", "startDate", "endDate", "description", "sortOrder", "updatedAt"`,
    [input.organization, input.role, input.division, input.startDate, input.endDate, input.description, input.sortOrder ?? null, id],
  )
  return result.rows[0] ? mapExperience(result.rows[0]) : null
}

export const deleteExperience = async (id: number) => {
  const result = await database.query('DELETE FROM "Experience" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderExperiences = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "Experience" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const findServices = async (): Promise<Service[]> => {
  const about = await findAboutContent()
  return about?.services ?? []
}

export const saveServices = async (services: Service[]) => {
  await database.query(
    `INSERT INTO "AboutContent" ("id", "heading", "paragraphs", "services", "updatedAt") VALUES (1, 'Building with purpose.', '{}', $1, CURRENT_TIMESTAMP)
     ON CONFLICT ("id") DO UPDATE SET "services" = $1, "updatedAt" = CURRENT_TIMESTAMP`,
    [JSON.stringify(services)],
  )
  return services
}

export const findActiveCv = async (): Promise<CvDocument | null> => {
  const result = await database.query('SELECT "url", "fileName", "updatedAt" FROM "CvDocument" WHERE "active" = true ORDER BY "updatedAt" DESC LIMIT 1')
  if (!result.rows[0]) return null
  return { url: String(result.rows[0].url), fileName: String(result.rows[0].fileName), updatedAt: new Date(String(result.rows[0].updatedAt)).toISOString() }
}

export const findCertificates = async (): Promise<Certificate[]> => {
  const result = await database.query('SELECT "id", "title", "issuer", "issueDate", "credentialUrl", "fileUrl", "fileName", "sortOrder" FROM "Certificate" ORDER BY "sortOrder", "createdAt" DESC')
  return result.rows.map(mapCertificate)
}

export const findCertificate = async (id: number): Promise<Record<string, unknown> | null> => {
  const result = await database.query('SELECT "id", "publicId", "resourceType" FROM "Certificate" WHERE "id" = $1', [id])
  return result.rows[0] ?? null
}

export const findCertificateDetails = async (id: number): Promise<Certificate & { publicId: string | null; resourceType: ResourceType } | null> => {
  const result = await database.query('SELECT "id", "title", "issuer", "issueDate", "credentialUrl", "fileUrl", "publicId", "resourceType", "fileName", "sortOrder" FROM "Certificate" WHERE "id" = $1', [id])
  const row = result.rows[0]
  if (!row) return null
  return {
    id: Number(row.id),
    title: String(row.title),
    issuer: String(row.issuer),
    issueDate: row.issueDate ? String(row.issueDate) : null,
    credentialUrl: row.credentialUrl ? String(row.credentialUrl) : null,
    fileUrl: String(row.fileUrl),
    fileName: String(row.fileName),
    sortOrder: Number(row.sortOrder),
    publicId: row.publicId ? String(row.publicId) : null,
    resourceType: row.resourceType === 'raw' ? 'raw' : 'image',
  }
}

export const createCertificate = async (input: CertificateInput) => {
  const result = await database.query(
    `INSERT INTO "Certificate" ("title", "issuer", "issueDate", "credentialUrl", "fileUrl", "publicId", "resourceType", "fileName", "sortOrder")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE((SELECT MAX("sortOrder") + 1 FROM "Certificate"), 0))
     RETURNING "id", "title", "issuer", "issueDate", "credentialUrl", "fileUrl", "fileName", "sortOrder"`,
    [input.title, input.issuer, input.issueDate, input.credentialUrl, input.fileUrl, input.publicId, input.resourceType, input.fileName],
  )
  return mapCertificate(result.rows[0])
}

export const updateCertificate = async (id: number, input: CertificateUpdateInput) => {
  const result = await database.query(
    `UPDATE "Certificate" SET "title" = $1, "issuer" = $2, "issueDate" = $3, "credentialUrl" = $4, "fileName" = COALESCE($5, "fileName"), "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $6 RETURNING "id", "title", "issuer", "issueDate", "credentialUrl", "fileUrl", "fileName", "sortOrder"`,
    [input.title, input.issuer, input.issueDate, input.credentialUrl, input.fileName ?? null, id],
  )
  return result.rows[0] ? mapCertificate(result.rows[0]) : null
}

export const updateCertificateFile = async (id: number, fileUrl: string, publicId: string, resourceType: ResourceType, fileName: string) => {
  const result = await database.query(
    `UPDATE "Certificate" SET "fileUrl" = $1, "publicId" = $2, "resourceType" = $3, "fileName" = $4, "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $5 RETURNING "id", "title", "issuer", "issueDate", "credentialUrl", "fileUrl", "fileName", "sortOrder"`,
    [fileUrl, publicId, resourceType, fileName, id],
  )
  return result.rows[0] ? mapCertificate(result.rows[0]) : null
}

export const deleteCertificate = async (id: number) => {
  const result = await database.query('DELETE FROM "Certificate" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderCertificates = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "Certificate" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const saveAboutContent = async (heading: string, paragraphs: string[], services: Service[]) => {
  await database.query(
    `INSERT INTO "AboutContent" ("id", "heading", "paragraphs", "services", "updatedAt") VALUES (1, $1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT ("id") DO UPDATE SET "heading" = $1, "paragraphs" = $2, "services" = $3, "updatedAt" = CURRENT_TIMESTAMP`,
    [heading, paragraphs, JSON.stringify(services)],
  )
}

export const saveProfileImage = async (url: string, publicId: string): Promise<{ profileImage: string } | null> => {
  const result = await database.query(
    `INSERT INTO "AboutContent" ("id", "heading", "paragraphs", "profileImage", "profileImagePublicId", "updatedAt") VALUES (1, 'Building with purpose.', '{}', $1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT ("id") DO UPDATE SET "profileImage" = $1, "profileImagePublicId" = $2, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING "profileImage"`,
    [url, publicId],
  )
  return result.rows[0] ?? null
}

export const replaceSkillGroups = async (groups: SkillGroupInput[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM "SkillGroup"')
    for (const [sortOrder, group] of groups.entries())
      await client.query('INSERT INTO "SkillGroup" ("title", "skills", "sortOrder") VALUES ($1, $2, $3)', [group.title, group.skills, sortOrder])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const replaceExperiences = async (items: ExperienceInput[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM "Experience"')
    for (const [sortOrder, item] of items.entries())
      await client.query(
        'INSERT INTO "Experience" ("organization", "role", "division", "startDate", "endDate", "description", "sortOrder") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.organization, item.role, item.division, item.startDate, item.endDate, item.description, item.sortOrder ?? sortOrder],
      )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const saveActiveCv = async (url: string, publicId: string, fileName: string) => {
  await database.query('UPDATE "CvDocument" SET "active" = false WHERE "active" = true')
  const result = await database.query(
    'INSERT INTO "CvDocument" ("url", "publicId", "fileName", "active") VALUES ($1, $2, $3, true) RETURNING "url", "fileName", "updatedAt"',
    [url, publicId, fileName],
  )
  return result.rows[0]
}

export const findActiveAudio = async (): Promise<Audio | null> => {
  const result = await database.query('SELECT "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt" FROM "Audio" WHERE "enabled" = true ORDER BY "sortOrder", "id" LIMIT 1')
  return result.rows[0] ? mapAudio(result.rows[0]) : null
}

export const findAllAudio = async (): Promise<Audio[]> => {
  const result = await database.query('SELECT "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt" FROM "Audio" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapAudio)
}

export const findAudio = async (id: number): Promise<Audio | null> => {
  const result = await database.query('SELECT "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt" FROM "Audio" WHERE "id" = $1', [id])
  return result.rows[0] ? mapAudio(result.rows[0]) : null
}

export const findAudioDetails = async (id: number): Promise<Audio | null> => {
  const result = await database.query('SELECT "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt" FROM "Audio" WHERE "id" = $1', [id])
  const row = result.rows[0]
  if (!row) return null
  return {
    id: Number(row.id),
    url: String(row.url),
    publicId: row.publicId ? String(row.publicId) : null,
    fileName: String(row.fileName),
    enabled: Boolean(row.enabled),
    loop: Boolean(row.loop),
    volume: Number(row.volume),
    sortOrder: Number(row.sortOrder),
    createdAt: new Date(String(row.createdAt)).toISOString(),
    updatedAt: new Date(String(row.updatedAt)).toISOString(),
  }
}

export const createAudio = async (input: CreateAudioInput) => {
  const result = await database.query(
    `INSERT INTO "Audio" ("url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder")
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "Audio")))
     RETURNING "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt"`,
    [input.url, input.publicId, input.fileName, input.enabled, input.loop, input.volume, input.sortOrder ?? null],
  )
  return mapAudio(result.rows[0])
}

export const updateAudio = async (id: number, input: Partial<AudioInput>) => {
  const fields: string[] = []
  const values: unknown[] = []
  let paramIndex = 1
  if (input.url !== undefined) {
    fields.push(`"url" = $${paramIndex++}`)
    values.push(input.url)
  }
  if (input.publicId !== undefined) {
    fields.push(`"publicId" = $${paramIndex++}`)
    values.push(input.publicId)
  }
  if (input.fileName !== undefined) {
    fields.push(`"fileName" = $${paramIndex++}`)
    values.push(input.fileName)
  }
  if (input.enabled !== undefined) {
    fields.push(`"enabled" = $${paramIndex++}`)
    values.push(input.enabled)
  }
  if (input.loop !== undefined) {
    fields.push(`"loop" = $${paramIndex++}`)
    values.push(input.loop)
  }
  if (input.volume !== undefined) {
    fields.push(`"volume" = $${paramIndex++}`)
    values.push(input.volume)
  }
  if (input.sortOrder !== undefined) {
    fields.push(`"sortOrder" = $${paramIndex++}`)
    values.push(input.sortOrder)
  }
  fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
  values.push(id)
  if (fields.length === 1) return null
  const result = await database.query(
    `UPDATE "Audio" SET ${fields.join(', ')} WHERE "id" = $${paramIndex} RETURNING "id", "url", "publicId", "fileName", "enabled", "loop", "volume", "sortOrder", "createdAt", "updatedAt"`,
    values,
  )
  return result.rows[0] ? mapAudio(result.rows[0]) : null
}

export const deleteAudio = async (id: number) => {
  const result = await database.query('DELETE FROM "Audio" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const findEnabledTools = async (): Promise<Tool[]> => {
  const result = await database.query('SELECT "id", "name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId", "createdAt", "updatedAt" FROM "Tool" WHERE "enabled" = true ORDER BY "sortOrder", "id"')
  return result.rows.map(mapTool)
}

export const findAllTools = async (): Promise<Tool[]> => {
  const result = await database.query('SELECT "id", "name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId", "createdAt", "updatedAt" FROM "Tool" ORDER BY "sortOrder", "id"')
  return result.rows.map(mapTool)
}

export const findTool = async (id: number): Promise<Tool | null> => {
  const result = await database.query('SELECT "id", "name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId", "createdAt", "updatedAt" FROM "Tool" WHERE "id" = $1', [id])
  return result.rows[0] ? mapTool(result.rows[0]) : null
}

export const createTool = async (input: CreateToolInput) => {
  const result = await database.query(
    `INSERT INTO "Tool" ("name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId")
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, (SELECT COALESCE(MAX("sortOrder"), -1) + 1 FROM "Tool")), $7)
     RETURNING "id", "name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId", "createdAt", "updatedAt"`,
    [input.name, input.iconUrl ?? null, input.iconPublicId ?? null, input.category ?? null, input.enabled, input.sortOrder ?? null, input.skillGroupId ?? null],
  )
  return mapTool(result.rows[0])
}

export const updateTool = async (id: number, input: Partial<ToolInput>) => {
  const fields: string[] = []
  const values: unknown[] = []
  let paramIndex = 1
  if (input.name !== undefined) {
    fields.push(`"name" = $${paramIndex++}`)
    values.push(input.name)
  }
  if (input.iconUrl !== undefined) {
    fields.push(`"iconUrl" = $${paramIndex++}`)
    values.push(input.iconUrl)
  }
  if (input.iconPublicId !== undefined) {
    fields.push(`"iconPublicId" = $${paramIndex++}`)
    values.push(input.iconPublicId)
  }
  if (input.category !== undefined) {
    fields.push(`"category" = $${paramIndex++}`)
    values.push(input.category)
  }
  if (input.enabled !== undefined) {
    fields.push(`"enabled" = $${paramIndex++}`)
    values.push(input.enabled)
  }
  if (input.sortOrder !== undefined) {
    fields.push(`"sortOrder" = $${paramIndex++}`)
    values.push(input.sortOrder)
  }
  if (input.skillGroupId !== undefined) {
    fields.push(`"skillGroupId" = $${paramIndex++}`)
    values.push(input.skillGroupId)
  }
  fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
  values.push(id)
  if (fields.length === 1) return null
  const result = await database.query(
    `UPDATE "Tool" SET ${fields.join(', ')} WHERE "id" = $${paramIndex} RETURNING "id", "name", "iconUrl", "iconPublicId", "category", "enabled", "sortOrder", "skillGroupId", "createdAt", "updatedAt"`,
    values,
  )
  return result.rows[0] ? mapTool(result.rows[0]) : null
}

export const deleteTool = async (id: number) => {
  const result = await database.query('DELETE FROM "Tool" WHERE "id" = $1 RETURNING "id"', [id])
  return result.rowCount === 1
}

export const reorderTools = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "Tool" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const reorderAudio = async (ids: number[]) => {
  const client = await database.connect()
  try {
    await client.query('BEGIN')
    for (const [sortOrder, id] of ids.entries())
      await client.query('UPDATE "Audio" SET "sortOrder" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2', [sortOrder, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
