import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getPublishedPortfolioProject, getPublishedPortfolioProjects } from '../api/projects.api'
import type { PortfolioProject } from '../data/portfolioProjects'

const ProjectDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<PortfolioProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [navProjects, setNavProjects] = useState<PortfolioProject[]>([])
  const [navLoading, setNavLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!slug) { setLoading(false); return }
    let mounted = true
    setLoading(true)
    getPublishedPortfolioProject(slug)
      .then((data) => { if (mounted) setProject(data) })
      .catch(() => { if (mounted) setProject(null) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    let mounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavLoading(true)
    getPublishedPortfolioProjects()
      .then((projects) => {
        if (!mounted) return
        setNavProjects(projects)
        const idx = projects.findIndex((p) => p.slug === slug)
        setProject((current) => {
          if (current) return current
          return idx >= 0 ? projects[idx] ?? null : null
        })
      })
      .catch(() => { /* keep current project */ })
      .finally(() => { if (mounted) setNavLoading(false) })
    return () => { mounted = false }
  }, [slug])

  const projectIndex = project ? navProjects.findIndex((item) => item.slug === project.slug) : -1
  const previousProject = projectIndex > 0 ? navProjects[projectIndex - 1] : undefined
  const nextProject = projectIndex >= 0 && projectIndex < navProjects.length - 1 ? navProjects[projectIndex + 1] : undefined

  if (loading || (project === null && navLoading)) {
    return <main className="project-detail"><p className="section-label">LOADING PROJECT</p></main>
  }

  if (!project) {
    return (
      <main className="project-detail project-detail-not-found">
        <p className="section-label">PROJECT NOT FOUND</p>
        <h1>This project is not available.</h1>
        <Link className="hero-primary-action" to="/projects">Back to projects</Link>
      </main>
    )
  }

  return (
    <main className="project-detail">
      <div className="project-detail-header">
        <button className="project-back-link" onClick={() => navigate(-1)} type="button">← Back</button>
        <p className="section-label">{project.number} — {project.category}</p>
        <h1>{project.title}</h1>
        <p className="project-detail-intro">{project.description}</p>
      </div>

      <div className="project-detail-media">
        {project.media?.type === 'video' ? (
          <video controls preload="metadata" playsInline>
            <source src={project.media.src} />
          </video>
        ) : project.media?.type === 'image' ? (
            <img src={project.media.src} alt={project.media.alt ?? project.title} loading="lazy" />
        ) : (
          <div className="project-media-placeholder">
            <span>MEDIA PLACEHOLDER</span>
            <strong>Add an image or video for this project</strong>
          </div>
        )}
      </div>

      <div className="project-case-study">
        <article className="case-study-section case-study-overview">
          <p className="section-label">01 — OVERVIEW</p>
          <p className="project-detail-description">{project.overview}</p>
        </article>

        <div className="case-study-grid">
          <article className="case-study-section">
            <p className="section-label">02 — THE PROBLEM</p>
            <p>{project.problem}</p>
          </article>
          <article className="case-study-section">
            <p className="section-label">03 — THE APPROACH</p>
            <p>{project.approach}</p>
          </article>
          <article className="case-study-section">
            <p className="section-label">04 — THE SOLUTION</p>
            <p>{project.solution}</p>
          </article>
          <article className="case-study-section">
            <p className="section-label">05 — TECHNOLOGY</p>
            <div className="project-detail-technologies">
              {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </article>
        </div>

        <div className="case-study-grid case-study-grid-lower">
          <article className="case-study-section">
            <p className="section-label">06 — KEY FEATURES</p>
            <ul className="case-study-features">
              {project.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </article>
          <article className="case-study-section">
            <p className="section-label">07 — RESULT</p>
            <p>{project.result}</p>
          </article>
          <article className="case-study-section">
            <p className="section-label">08 — VISUAL GALLERY</p>
            {project.gallery.length > 0 ? (
              <div className="case-study-gallery">
                {project.gallery.map((image) => <img key={image} src={image} alt={`${project.title} detail`} loading="lazy" />)}
              </div>
            ) : <p className="case-study-muted">Project images will be added here.</p>}
          </article>
          <article className="case-study-section">
            <p className="section-label">09 — REFLECTION</p>
            <p>{project.reflection}</p>
          </article>
        </div>

        <div className="case-study-links">
          <p className="section-label">10 — PROJECT LINKS</p>
          {project.github ? <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a> : <span>GitHub link coming soon</span>}
          {project.liveDemo ? <a href={project.liveDemo} target="_blank" rel="noreferrer">Live demo ↗</a> : <span>Live demo coming soon</span>}
        </div>
      </div>

      <nav className="project-next-navigation" aria-label="Project navigation">
        {previousProject ? <Link to={`/projects/${previousProject.slug}`}>← {previousProject.title}</Link> : <span />}
        {nextProject ? <Link to={`/projects/${nextProject.slug}`}>{nextProject.title} →</Link> : <Link to="/projects">Back to portfolio →</Link>}
      </nav>
    </main>
  )
}

export default ProjectDetail
