import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminContent,
  getAdminProfile,
  getAdminReviews,
  type AdminReview,
  type CertificateInput,
  type EducationInput,
  type ExperienceInput,
  type ServiceInput,
  type SkillGroupInput,
} from '../api/admin.api'

const AdminOverview = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<{ name: string | null; professionalTitle: string | null; shortIntroduction: string | null; location: string | null; email: string | null; phone: string | null } | null>(null)
  const [skills, setSkills] = useState<SkillGroupInput[]>([])
  const [experience, setExperience] = useState<ExperienceInput[]>([])
  const [education, setEducation] = useState<EducationInput[]>([])
  const [services, setServices] = useState<ServiceInput[]>([])
  const [certificates, setCertificates] = useState<CertificateInput[]>([])
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [content, profileRes, reviewsRes] = await Promise.all([
        getAdminContent(),
        getAdminProfile(),
        getAdminReviews(),
      ])
      if (mountedRef.current) {
        setProfile(profileRes)
        setSkills(content.skills)
        setExperience(content.experience)
        setEducation(content.education)
        setServices(content.about?.services ?? [])
        setCertificates(content.certificates)
        setReviews(reviewsRes)
      }
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load overview.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData() }, [loadData])

  const pendingReviews = reviews.filter((r) => r.status === 'PENDING').length

  const statCards = [
    { label: 'Projects', value: 'Manage', href: '/admin/projects', note: 'Case studies & gallery' },
    { label: 'Profile / About', value: profile ? 'Live' : 'Empty', href: '/admin/profile', note: profile?.professionalTitle ?? 'No title set' },
    { label: 'Experience', value: experience.length, href: '/admin/experience', note: `${experience.length} position(s)` },
    { label: 'Education', value: education.length, href: '/admin/education', note: `${education.length} entr(ies)` },
    { label: 'Skills', value: skills.length, href: '/admin/skills', note: `${skills.length} group(s)` },
    { label: 'Certificates', value: certificates.length, href: '/admin/certificates', note: `${certificates.length} credential(s)` },
    { label: 'Services', value: services.length, href: '/admin/services', note: `${services.length} service(s)` },
    { label: 'Reviews', value: reviews.length, href: '/admin/reviews', note: `${pendingReviews} pending` },
    { label: 'Settings', value: 'Open', href: '/admin/settings', note: 'Social links & CV' },
  ]

  if (loading) return <p className="review-state">Loading overview…</p>

  return (
    <div className="admin-overview">
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-overview__stats">
        {statCards.map((card) => (
          <button key={card.href} type="button" className="admin-stat-card" onClick={() => navigate(card.href)}>
            <span className="admin-stat-card__label">{card.label}</span>
            <strong className="admin-stat-card__value">{card.value}</strong>
            <small className="admin-stat-card__note">{card.note}</small>
          </button>
        ))}
      </div>
      <div className="admin-overview__recent">
        <div className="admin-form-heading"><div><p className="section-label">RECENT ACTIVITY</p><h2>Latest content</h2></div></div>
        <div className="admin-overview__grid">
          <section>
            <h3>Profile</h3>
            {profile ? (
              <p>{profile.name ?? 'Unnamed'}{profile.professionalTitle ? ` · ${profile.professionalTitle}` : ''}</p>
            ) : <p className="review-state">No profile data yet.</p>}
          </section>
          <section>
            <h3>Experience</h3>
            {experience.length === 0 ? <p className="review-state">No experience entries.</p> : experience.slice(0, 3).map((item) => <p key={item.id ?? item.organization}>{item.role} — {item.organization}</p>)}
          </section>
          <section>
            <h3>Education</h3>
            {education.length === 0 ? <p className="review-state">No education entries.</p> : education.slice(0, 3).map((item) => <p key={item.id ?? item.institution}>{item.degree} — {item.institution}</p>)}
          </section>
          <section>
            <h3>Certificates</h3>
            {certificates.length === 0 ? <p className="review-state">No certificates.</p> : certificates.slice(0, 3).map((item) => <p key={item.id ?? item.title}>{item.title} — {item.issuer}</p>)}
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview