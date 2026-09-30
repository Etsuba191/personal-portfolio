import { useEffect, useState } from 'react'
import { getPublicContent } from '../../api/content.api'

const Certificates = () => {
  const [certificates, setCertificates] = useState<Array<{ id: number; title: string; issuer: string; issueDate: string | null; fileUrl: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => setCertificates(content.certificates))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load certificates.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <section className="certificates-section"><p className="review-state">Loading certificates...</p></section>
  if (error) return <section className="certificates-section"><p className="form-error review-state" role="alert">{error}</p></section>
  if (!certificates.length) return null

  return (
    <section className="certificates-section" id="certificates">
      <div className="section-header"><p className="section-label">CERTIFICATES</p><h2>Proof of <span>practice.</span></h2></div>
      <div className="certificates-grid">{certificates.map((certificate) => <article className="certificate-card" key={certificate.id}><div><p className="certificate-issuer">{certificate.issuer}</p><h3>{certificate.title}</h3>{certificate.issueDate && <p className="certificate-date">{certificate.issueDate}</p>}</div><a href={certificate.fileUrl} target="_blank" rel="noreferrer">View certificate ↗</a></article>)}</div>
    </section>
  )
}

export default Certificates
