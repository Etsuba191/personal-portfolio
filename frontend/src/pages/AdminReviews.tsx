import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteReview, getAdminReviews, updateAdminReview, updateReviewStatus, type AdminReview } from '../api/admin.api'

type ReviewForm = Omit<AdminReview, 'id' | 'createdAt' | 'updatedAt' | 'photoUrl'>

const emptyReview: ReviewForm = {
  name: '',
  email: '',
  role: '',
  company: null,
  rating: 5,
  comment: '',
  status: 'PENDING',
}

const AdminReviews = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [status, setStatus] = useState<'all' | AdminReview['status']>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ReviewForm>(emptyReview)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadReviews = useCallback(async () => {
    try {
      const data = await getAdminReviews()
      if (mountedRef.current) setReviews(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load reviews.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadReviews() }, [loadReviews])

  const edit = (review: AdminReview) => {
    setEditingId(review.id)
    setForm({
      name: review.name,
      email: review.email,
      role: review.role,
      company: review.company,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
    })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setEditingId(null)
    setForm(emptyReview)
    setMessage(''); setError('')
  }

  const updateField = <Field extends keyof ReviewForm>(field: Field, value: ReviewForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingId) return
    setSaving(true); setMessage(''); setError('')
    try {
      const updated = await updateAdminReview(editingId, form)
      setReviews((current) => current.map((review) => review.id === editingId ? updated.data : review))
      reset()
      setMessage('Review updated.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update review.') } finally { setSaving(false) }
  }

  const changeStatus = async (id: number, nextStatus: 'approve' | 'reject') => {
    try {
      await updateReviewStatus(id, nextStatus)
      await loadReviews()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update review.')
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this review permanently?')) return
    try {
      await deleteReview(id)
      setReviews((current) => current.filter((review) => review.id !== id))
      if (editingId === id) reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete review.')
    }
  }

  const visibleReviews = status === 'all' ? reviews : reviews.filter((review) => review.status === status)

  return (
    <div className="admin-reviews-page">
      <form className="admin-project-form" onSubmit={(event) => { event.preventDefault(); void save(event) }}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT REVIEW' : 'REVIEW DETAILS'}</p><h2>{editingId ? 'Update testimonial' : 'Select a review to edit'}</h2></div>{editingId && <button className="admin-text-button" type="button" onClick={reset}>Cancel</button>}</div>
        <div className="admin-form-grid">
          <label>Name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required disabled={!editingId} /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required disabled={!editingId} /></label>
          <label>Role<input value={form.role} onChange={(event) => updateField('role', event.target.value)} required disabled={!editingId} /></label>
          <label>Company<input value={form.company ?? ''} onChange={(event) => updateField('company', event.target.value || null)} disabled={!editingId} /></label>
          <label>Rating<input type="number" min="1" max="5" value={form.rating} onChange={(event) => updateField('rating', Number(event.target.value))} required disabled={!editingId} /></label>
          <label>Status<select value={form.status} onChange={(event) => updateField('status', event.target.value as ReviewForm['status'])} disabled={!editingId}><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option></select></label>
          <label className="admin-form-wide">Comment<textarea rows={5} value={form.comment} onChange={(event) => updateField('comment', event.target.value)} required disabled={!editingId} /></label>
        </div>
        <button className="contact-button" type="submit" disabled={!editingId || saving}>{saving ? 'Saving...' : 'Save review'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <div className="admin-tabs" role="tablist" aria-label="Review status">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button type="button" className={status === tab ? 'is-active' : ''} key={tab} onClick={() => setStatus(tab)}>
            {tab === 'all' ? 'All reviews' : tab}
          </button>
        ))}
      </div>
      {loading && <p className="review-state">Loading reviews...</p>}
      {!loading && error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && visibleReviews.length === 0 && <p className="review-state">No reviews in this category.</p>}
      <div className="admin-review-list">
        {visibleReviews.map((review) => {
          const r = Math.floor(Math.max(1, Math.min(5, Number(review.rating) || 0)));
          return (
            <article className="admin-review-card" key={review.id}>
              <div className="admin-review-person">
                {review.photoUrl ? <img src={review.photoUrl} alt="" /> : <span>{review.name.charAt(0)}</span>}
                <div>
                  <h2>{review.name}</h2>
                  <p>{review.role}{review.company ? ` · ${review.company}` : ''}</p>
                  <small>{review.email}</small>
                </div>
              </div>
              <div className="review-stars" aria-label={`${r} out of 5 stars`}>
                {'★'.repeat(r)}
                <span>{'★'.repeat(5 - r)}</span>
              </div>
              <p className="admin-review-comment">{review.comment}</p>
              <div className="admin-review-actions">
                <strong className={`review-status review-status-${review.status.toLowerCase()}`}>{review.status}</strong>
                <button type="button" onClick={() => edit(review)}>Edit</button>
                {review.status !== 'APPROVED' && <button type="button" onClick={() => void changeStatus(review.id, 'approve')}>Approve</button>}
                {review.status !== 'REJECTED' && <button type="button" onClick={() => void changeStatus(review.id, 'reject')}>Reject</button>}
                <button type="button" onClick={() => void remove(review.id)}>Delete</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  )
}

export default AdminReviews
