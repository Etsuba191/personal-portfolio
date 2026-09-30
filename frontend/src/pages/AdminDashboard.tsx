import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteReview, getAdminReviews, logoutAdmin, updateReviewStatus, type AdminReview } from '../api/admin.api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [status, setStatus] = useState<'all' | AdminReview['status']>('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete review.')
    }
  }

  const signOut = async () => {
    await logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  const visibleReviews = status === 'all' ? reviews : reviews.filter((review) => review.status === status)

  return (
    <main className="admin-page">
      <header className="admin-header"><div><p className="section-label">PRIVATE CMS</p><h1>Portfolio reviews</h1></div><div className="admin-header-actions"><button className="admin-text-button" type="button" onClick={() => navigate('/admin/projects')}>Projects</button><button className="admin-text-button" type="button" onClick={() => navigate('/admin/content')}>Content</button><button className="admin-text-button" type="button" onClick={signOut}>Sign out</button></div></header>
      <div className="admin-tabs" role="tablist" aria-label="Review status">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => <button type="button" className={status === tab ? 'is-active' : ''} key={tab} onClick={() => setStatus(tab)}>{tab === 'all' ? 'All reviews' : tab}</button>)}
      </div>
      {loading && <p className="review-state">Loading reviews...</p>}
      {!loading && error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && visibleReviews.length === 0 && <p className="review-state">No reviews in this category.</p>}
      <div className="admin-review-list">
        {visibleReviews.map((review) => {
          const r = Math.floor(Math.max(1, Math.min(5, Number(review.rating) || 0)));
          return <article className="admin-review-card" key={review.id}>
            <div className="admin-review-person">{review.photoUrl ? <img src={review.photoUrl} alt="" /> : <span>{review.name.charAt(0)}</span>}<div><h2>{review.name}</h2><p>{review.role}{review.company ? ` · ${review.company}` : ''}</p><small>{review.email}</small></div></div>
            <div className="review-stars" aria-label={`${r} out of 5 stars`}>{'★'.repeat(r)}<span>{'★'.repeat(5 - r)}</span></div>
            <p className="admin-review-comment">{review.comment}</p>
            <div className="admin-review-actions"><strong className={`review-status review-status-${review.status.toLowerCase()}`}>{review.status}</strong>{review.status !== 'APPROVED' && <button type="button" onClick={() => void changeStatus(review.id, 'approve')}>Approve</button>}{review.status !== 'REJECTED' && <button type="button" onClick={() => void changeStatus(review.id, 'reject')}>Reject</button>}<button type="button" onClick={() => void remove(review.id)}>Delete</button></div>
          </article>;
        })}
      </div>
    </main>
  )
}

export default AdminDashboard