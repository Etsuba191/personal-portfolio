import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import healthRouter from './routes/health.routes'
import projectRouter from './routes/project.routes'
import contactRouter from './routes/contact.routes'
import reviewRouter from './routes/review.routes'
import authRouter from './routes/auth.routes'
import adminProjectRouter from './routes/admin-project.routes'
import contentRouter from './routes/content.routes'
import adminContentRouter from './routes/admin-content.routes'
import { logger } from './middleware/logger.middleware'

const app = express()

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173']

const cspDirectives = {
	defaultSrc: ["'self'"],
	scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
	styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
	fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
	imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
	mediaSrc: ["'self'", 'https://res.cloudinary.com', 'blob:'],
	connectSrc: ["'self'", process.env.FRONTEND_URL ?? 'http://localhost:5173'],
	frameAncestors: ["'none'"],
	baseUri: ["'self'"],
	formAction: ["'self'"],
}

const loginLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: { success: false, message: 'Too many login attempts. Please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
})

const submissionLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 10,
	message: { success: false, message: 'Too many submissions. Please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
})

const uploadLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: { success: false, message: 'Too many uploads. Please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
})

app.use(helmet({
	contentSecurityPolicy: {
		directives: cspDirectives,
	},
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	credentials: true,
}))
app.use(express.json())
app.use(logger)

app.use('/api/health', healthRouter)
app.use('/api/projects', projectRouter)
app.use('/api/contact', submissionLimiter, contactRouter)
app.use('/api/reviews', submissionLimiter, reviewRouter)
app.use('/api/auth', loginLimiter, authRouter)
app.use('/api/admin/projects', uploadLimiter, adminProjectRouter)
app.use('/api/content', contentRouter)
app.use('/api/admin/content', uploadLimiter, adminContentRouter)

export default app