
import { useEffect, useState } from 'react'
import { getPublicContent } from '../../api/content.api'

const AboutSection = () => {
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => {
        setParagraphs(content.about?.paragraphs ?? [])
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load about content.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (!loading && !error && paragraphs.length === 0) {
    return null
  }

  return (
    <section className="about-section" id="about">
      <div className="section-header">
        <p className="section-label">ABOUT ME</p>
        <h2>
          Building with <span>purpose.</span>
        </h2>
      </div>

      {loading && (
        <p className="review-state">Loading about content...</p>
      )}

      {error && (
        <p className="form-error review-state" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && paragraphs.length > 0 && (
        <div className="about-content">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>
              {paragraph.split('\n').map((line, lineIndex) => (
                <span key={`${line}-${lineIndex}`}>
                  {lineIndex > 0 && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}

export default AboutSection
