import dotenv from 'dotenv'
import path from 'node:path'
import app from './app'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const PORT = process.env.PORT || 4000
const isMissingOrPlaceholder = (value: string | undefined) =>
  !value || value.startsWith('your-')

const missingMailSettings = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASSWORD']
  .filter((setting) => isMissingOrPlaceholder(process.env[setting]))

const missingCmsSettings = ['DATABASE_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET']
  .filter((setting) => isMissingOrPlaceholder(process.env[setting]))

if (missingMailSettings.length > 0) {
  console.warn(`Contact email is disabled. Missing: ${missingMailSettings.join(', ')}. Add them to backend/.env.`)
}

if (missingCmsSettings.length > 0) {
  console.warn(`CMS features are disabled or incomplete. Missing: ${missingCmsSettings.join(', ')}. Add them to backend/.env.`)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})