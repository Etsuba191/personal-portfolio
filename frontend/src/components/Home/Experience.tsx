import { useEffect, useState } from 'react'
import { getPublicContent, type PublicContent } from '../../api/content.api'

const Experience = () => {
  const [items, setItems] = useState<PublicContent['experience']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => setItems(content.experience ?? []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load experience.'))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !error && items.length === 0) return null

  return (
    <section className="experience-section" id="experience">
      <div className="section-header"><p className="section-label">EXPERIENCE</p><h2>Work that <span>shaped me.</span></h2></div>
      {loading && <p className="review-state">Loading experience...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && items.length > 0 && (
        <div className="experience-list">
          {items.map((item) => (
            <article className="experience-item" key={item.id}>
              <div className="experience-item__date">{item.startDate} - {item.endDate}</div>
              <div className="experience-item__content">
                <p className="section-label">{item.organization}</p>
                <h3>{item.role}</h3>
                {item.division && <p className="experience-item__division">{item.division}</p>}
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Experience