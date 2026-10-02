import { useEffect, useState } from 'react'
import { getPublicContent } from '../../api/content.api'

type Service = { number: string; icon: string; title: string; description: string }

const Services = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => setServices(content.about?.services ?? []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load services.'))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !error && services.length === 0) return null

  return (
    <section className="services-section" id="services">
      <div className="section-header">
        <p className="section-label">WHAT I DO</p>
        <h2>My <span>services.</span></h2>
      </div>
      {loading && <p className="review-state">Loading services...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && services.length > 0 && (
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-card-top"><span className="service-icon" aria-hidden="true">{service.icon}</span><span className="service-number">{service.number}</span></div>
              <h3>{service.title}</h3><p>{service.description}</p><span className="service-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Services
