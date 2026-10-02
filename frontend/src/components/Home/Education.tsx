import { useEffect, useState } from 'react'
import { getPublicContent, type PublicContent } from '../../api/content.api'

const Education = () => {
  const [items, setItems] = useState<PublicContent['education']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => setItems(content.education ?? []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load education.'))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !error && items.length === 0) return null

  return (
    <section className="education-section" id="education">
      <div className="section-header"><p className="section-label">EDUCATION</p><h2>Learning that <span>shaped me.</span></h2></div>
      {loading && <p className="review-state">Loading education...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && items.length > 0 && (
        <div className="education-list">
          {items.map((item) => (
            <article className="education-item" key={item.id}>
              <div className="education-item__date">{item.startDate || '—'} - {item.endDate || '—'}</div>
              <div className="education-item__content">
                <p className="section-label">{item.institution}</p>
                <h3>{item.degree}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Education
