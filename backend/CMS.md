# Portfolio CMS deployment

The public portfolio remains unauthenticated. The private CMS is available at `/admin` and uses the backend HTTP-only session cookie.

## Production services

- Managed PostgreSQL for `DATABASE_URL`
- Cloudinary for project images, review photos, and CV files
- HTTPS frontend and backend deployments

## Environment

Set these variables on the backend deployment using `.env.example`:

- `PORT`
- `FRONTEND_URL`
- `DATABASE_URL`
- `DATABASE_SSL=true` when required by the database provider
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- SMTP variables for the contact form

Set `VITE_API_URL` on the frontend deployment to the production backend API base URL, such as `https://api.example.com/api`, then rebuild the frontend.

## Database and media

Apply the committed migrations from the `backend` directory against the production PostgreSQL database. Do not use destructive reset commands in production. Cloudinary stores project images, review photos, and CV PDFs; PostgreSQL stores only URLs, public IDs, and content metadata.

For local development, from `backend` run `docker compose up -d postgres`, then add this to `backend/.env`:

```env
DATABASE_URL=postgresql://portfolio:portfolio-local-password@localhost:5432/portfolio
DATABASE_SSL=false
```

Apply the committed SQL files in timestamp order with your PostgreSQL migration workflow. Once the database is running and migrated, restart the backend. The `ECONNREFUSED 127.0.0.1:5432` errors stop when PostgreSQL is listening and `DATABASE_URL` points to it.

## Admin and cookies

There is no public admin registration. Set a strong `ADMIN_PASSWORD_HASH`, `ADMIN_EMAIL`, and long random `SESSION_SECRET`, then sign in at `/admin/login`. `FRONTEND_URL` must exactly match the deployed frontend origin. HTTPS is required for the production admin cookie and credentialed cross-origin requests.

## Implemented CMS capabilities

- Published project reads with legacy fallback during migration
- Admin project create/edit/delete and publish/unpublish
- Cloudinary project gallery upload/delete/reorder
- Public approved testimonials and protected moderation
- Admin About, Skills, and Experience editing
- Active CV upload with public download URL

Before launch, test migrations on a disposable database, submit a review with and without a photo, approve it, publish a project, upload gallery images, and replace the CV.