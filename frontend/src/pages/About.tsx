import { useEffect, useState } from 'react'
import { getPublicContent } from '../api/content.api'

const About = () => {
  const [content, setContent] = useState<{ heading: string; paragraphs: string[]; profileImage: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((result) => setContent(result.about))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load about content.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="about-page">
      {loading && <p className="review-state">Loading about content...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && content && (
        <section className="about-section" id="about">
          <div className="section-header"><p className="section-label">ABOUT ME</p><h2>{content.heading} <span>Let's build.</span></h2></div>
          <div className="about-content">
            <div className="about-text">
              <div>{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </div>
            {content.profileImage && <img className="about-page-image" src={content.profileImage} alt="Profile" />}
          </div>
        </section>
      )}
    </main>
  )
}

export default About
