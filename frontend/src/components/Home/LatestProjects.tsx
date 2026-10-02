import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedPortfolioProjects } from '../../api/projects.api'
import type { PortfolioProject } from '../../data/portfolioProjects'

const LatestProjects = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublishedPortfolioProjects()
      .then(setProjects)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load projects.'))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !error && projects.length === 0) return null

  return (
    <section className="projects-section" id="work">
      <div className="section-header"><p className="section-label">SELECTED WORK</p><h2>Latest <span>projects.</span></h2></div>
      {loading && <p className="review-state">Loading projects...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && projects.length > 0 && (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link className="project-card" key={project.slug} to={`/projects/${project.slug}`}>
              <div className="project-media-thumb" aria-hidden="true">
                {project.media?.type === 'image' ? <img src={project.media.src} alt="" loading="lazy" /> : project.media?.type === 'video' ? <video src={project.media.src} muted loop playsInline preload="metadata" /> : <span>PROJECT MEDIA</span>}
                <span className="project-view-label">View Project ↗</span>
              </div>
              <span className="project-number">{project.number}</span>
              <div><p className="project-category">{project.category}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p><p className="project-tech">{project.technologies.join(' · ')}</p></div>
              <span className="project-arrow">↗</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default LatestProjects
