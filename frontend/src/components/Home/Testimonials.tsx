import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { getApprovedReviews, submitReview, type PublicReview } from '../../api/reviews.api'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']

const Testimonials = () => {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const [photo, setPhoto] = useState<File>()
  const [form, setForm] = useState({ name: '', email: '', role: '', company: '', rating: 5, comment: '' })

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviews(await getApprovedReviews())
      } catch (requestError) {
        setLoadError(requestError instanceof Error ? requestError.message : 'Unable to load testimonials.')
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0]
    setError('')
    if (!selectedPhoto) return
    if (!acceptedPhotoTypes.includes(selectedPhoto.type)) {
      setError('Please choose a JPG, PNG, or WebP image.')
      return
    }
    if (selectedPhoto.size > MAX_PHOTO_SIZE) {
      setError('Profile photos must be 5 MB or smaller.')
      return
    }
    setPhoto(selectedPhoto)
    setPreview(URL.createObjectURL(selectedPhoto))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setStatus('sending')
    try {
      await submitReview({ ...form, photo })
      setForm({ name: '', email: '', role: '', company: '', rating: 5, comment: '' })
      setPhoto(undefined)
      setPreview('')
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit your review.')
    }
  }

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-header">
        <p className="section-label">WHAT PEOPLE SAY</p>
        <h2>Built through<span>collaboration.</span></h2>
        <button className="review-toggle" type="button" onClick={() => setFormOpen((open) => !open)}>{formOpen ? 'Close form' : 'Leave a review'} <span aria-hidden="true">↗</span></button>
      </div>

      {loading && <p className="review-state">Loading testimonials...</p>}
      {!loading && loadError && <p className="form-error review-state" role="alert">{loadError}</p>}
      {!loading && !loadError && reviews.length === 0 && (
        <div className="testimonials-grid"><article className="testimonial-card collaboration-card"><span className="quote-mark">“</span><p className="testimonial-quote">Every project has taught me something new, from working with spatial data and maps to designing full-stack applications.</p><div className="testimonial-author"><strong>Learning · Building · Improving</strong></div></article></div>
      )}
      {!loading && reviews.length > 0 && (
        <div className="testimonials-grid">
          {reviews.map((review) => {
            const r = Math.floor(Math.max(1, Math.min(5, Number(review.rating) || 0)));
            return <article className="testimonial-card" key={review.id}>
              <div className="review-person">{review.photoUrl ? <img src={review.photoUrl} alt="" loading="lazy" /> : <span className="review-avatar-fallback">{review.name.charAt(0)}</span>}<div className="testimonial-author"><strong>{review.name}</strong><span>{review.role}{review.company ? ` · ${review.company}` : ''}</span></div></div>
              <div className="review-stars" aria-label={`${r} out of 5 stars`}>{'★'.repeat(r)}<span>{'★'.repeat(5 - r)}</span></div>
              <p className="testimonial-quote">“{review.comment}”</p>
            </article>;
          })}
        </div>
      )}

      {formOpen && <form className="review-form" onSubmit={handleSubmit}>
        <div className="review-form-heading"><p className="section-label">SHARE YOUR EXPERIENCE</p><h3>Leave a review</h3></div>
        <div className="review-form-grid">
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email <span>(private)</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Role / Position<input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
          <label>Company / Organization <span>(optional)</span><input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label>
          <label className="review-form-wide">Profile photo <span>(optional, max 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />{preview && <img className="review-photo-preview" src={preview} alt="Profile preview" />}</label>
          <fieldset className="review-rating">
            <legend>Rating</legend>
            <div className="review-rating" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((ratingValue) => (
                <button
                  key={ratingValue}
                  type="button"
                  aria-label={`Rate ${ratingValue} out of 5`}
                  aria-pressed={form.rating === ratingValue}
                  className={form.rating === ratingValue ? 'active' : ''}
                  onClick={() => setForm((prev) => ({ ...prev, rating: ratingValue }))}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <label className="review-form-wide">Testimonial<textarea required minLength={10} maxLength={2000} rows={5} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} /></label>
        </div>
        <button className="contact-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Submitting...' : 'Submit review ↗'}</button>
        {status === 'success' && <p className="form-success" role="status">Thank you for your review! Your testimonial has been submitted and is waiting for approval.</p>}
        {status === 'error' && <p className="form-error" role="alert">{error}</p>}
      </form>}
    </section>
  )
}

export default Testimonials