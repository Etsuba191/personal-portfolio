import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminContent, saveAdminAbout, saveAdminProfile, uploadAdminProfileImage } from '../api/admin.api'

type ProfileInput = {
  name: string
  professionalTitle: string
  shortIntroduction: string
  location: string
  email: string
  phone: string
}

const emptyProfile: ProfileInput = {
  name: '',
  professionalTitle: '',
  shortIntroduction: '',
  location: '',
  email: '',
  phone: '',
}

const AdminProfile = () => {
  const navigate = useNavigate()
  const [about, setAbout] = useState<{ heading: string; paragraphs: string[]; profileImage: string | null } | null>(null)
  const [profile, setProfile] = useState<ProfileInput | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = useCallback(async () => {
    try {
      const adminContent = await getAdminContent()
      if (mountedRef.current) {
        setAbout(adminContent.about ? {
          heading: adminContent.about.heading,
          paragraphs: adminContent.about.paragraphs,
          profileImage: adminContent.about.profileImage,
        } : null)
        setProfile(adminContent.profile ? {
          name: adminContent.profile.name ?? '',
          professionalTitle: adminContent.profile.professionalTitle ?? '',
          shortIntroduction: adminContent.profile.shortIntroduction ?? '',
          location: adminContent.profile.location ?? '',
          email: adminContent.profile.email ?? '',
          phone: adminContent.profile.phone ?? '',
        } : { ...emptyProfile })
      }
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load profile.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateAboutField = <Field extends 'heading' | 'paragraphs'>(field: Field, value: string | string[]) => {
    setAbout((current) => current ? { ...current, [field]: value } : current)
  }

  const updateProfileField = <Field extends keyof ProfileInput>(field: Field, value: string) => {
    setProfile((current) => current ? { ...current, [field]: value } : current)
  }

  const save = async () => {
    if (!about || !profile) return
    setSaving(true); setMessage(''); setError('')
    try {
      await Promise.all([
        saveAdminProfile(profile),
        saveAdminAbout({ heading: about.heading, paragraphs: about.paragraphs }),
      ])
      setMessage('Profile and about content saved.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save profile.') } finally { setSaving(false) }
  }

  const uploadProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Use a JPG, PNG, or WebP image under 10 MB.'); event.target.value = ''; return }
    try {
      const uploaded = await uploadAdminProfileImage(file)
      setAbout((current) => current ? { ...current, profileImage: uploaded.profileImage } : current)
      setMessage('Profile image updated.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to upload profile image.') } finally { event.target.value = '' }
  }

  if (loading) return <p className="review-state">Loading profile…</p>
  if (!about || !profile) return <p className="form-error" role="alert">{error || 'Profile not available.'}</p>

  return (
    <div className="admin-profile-page">
      <form className="admin-project-form" onSubmit={(event) => { event.preventDefault(); void save() }}>
        <div className="admin-form-heading"><div><p className="section-label">PROFILE / ABOUT</p><h2>Personal details</h2></div><button className="admin-text-button" type="button" onClick={() => navigate('/admin')}>Back to overview</button></div>
        <div className="admin-form-grid">
          <label>Name<input value={profile.name} onChange={(event) => updateProfileField('name', event.target.value)} required /></label>
          <label>Professional title<input value={profile.professionalTitle} onChange={(event) => updateProfileField('professionalTitle', event.target.value)} required /></label>
          <label className="admin-form-wide">Short introduction<textarea value={profile.shortIntroduction} onChange={(event) => updateProfileField('shortIntroduction', event.target.value)} rows={3} required /></label>
          <label>Location<input value={profile.location} onChange={(event) => updateProfileField('location', event.target.value)} /></label>
          <label>Email<input type="email" value={profile.email} onChange={(event) => updateProfileField('email', event.target.value)} /></label>
          <label className="admin-form-wide">Phone<input value={profile.phone} onChange={(event) => updateProfileField('phone', event.target.value)} /></label>
          <label className="admin-form-wide">About heading<input value={about.heading} onChange={(event) => updateAboutField('heading', event.target.value)} required /></label>
          <label className="admin-form-wide">Paragraphs <span className="admin-field-hint">one paragraph per line</span><textarea rows={7} value={about.paragraphs.join('\n')} onChange={(event) => updateAboutField('paragraphs', event.target.value.split('\n'))} required /></label>
        </div>

        <div className="admin-form-heading"><div><p className="section-label">PROFILE PHOTO</p><h2>Hero image</h2></div></div>
        {about.profileImage && <img className="admin-profile-preview" src={about.profileImage} alt="Current profile" />}
        <label className="admin-upload-button">Upload profile image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadProfileImage(event)} /></label>

        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </div>
  )
}

export default AdminProfile
