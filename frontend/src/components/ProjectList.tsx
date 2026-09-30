import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedPortfolioProjects } from '../api/projects.api'
import type { PortfolioProject } from '../data/portfolioProjects'

const ProjectList = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPublishedPortfolioProjects()
      .then(setProjects)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Failed to load projects.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <section className="projects-section"><p className="review-state">Loading projects...</p></section>
  if (error) return <section className="projects-section"><p className="form-error review-state" role="alert">{error}</p></section>
  if (!projects.length) return <section className="projects-section"><p className="review-state">No published projects yet.</p></section>

  return (
    <section className="projects-section" id="work">
      <div className="section-header">
        <p className="section-label">SELECTED WORK</p>
        <h2>Latest <span>projects.</span></h2>
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <Link className="project-card" key={project.slug} to={`/projects/${project.slug}`}>
            <div className="project-media-thumb" aria-hidden="true">
              {project.media?.type === 'image' ? <img src={project.media.src} alt="" /> : project.media?.type === 'video' ? <video src={project.media.src} muted loop playsInline preload="metadata" /> : <span>PROJECT MEDIA</span>}
              <span className="project-view-label">View Project ↗</span>
            </div>
            <span className="project-number">{project.number}</span>
            <div>
              <p className="project-category">{project.category}</p>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <p className="project-tech">{project.technologies.join(' · ')}</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ProjectList
