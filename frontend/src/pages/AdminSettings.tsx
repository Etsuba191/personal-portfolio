import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicContent } from '../api/content.api'
import {
  getAdminContent,
  uploadAdminCv,
  createAdminSocialLink,
  updateAdminSocialLink,
  deleteAdminSocialLink,
  reorderAdminSocialLinks,
  type SocialLinkInput,
} from '../api/admin.api'

const emptySocialLink: SocialLinkInput = { platform: 'github', label: '', url: '' }

const AdminSettings = () => {
  const navigate = useNavigate()
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([])
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null)
  const [socialForm, setSocialForm] = useState<SocialLinkInput>(emptySocialLink)
  const [cvFileName, setCvFileName] = useState<string | null>(null)
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
      const [content, publicContent] = await Promise.all([getAdminContent(), getPublicContent()])
      if (mountedRef.current) {
        setSocialLinks(content.socialLinks)
        setCvFileName(publicContent.cv?.fileName ?? null)
      }
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load settings.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const resetSocialLink = () => {
    setEditingLinkId(null)
    setSocialForm(emptySocialLink)
    setMessage('')
    setError('')
  }

  const saveSocialLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!socialForm.label || !socialForm.url) { setError('Social link label and URL are required.'); return }
    setSaving(true); setMessage(''); setError('')
    try {
      const saved = editingLinkId
        ? await updateAdminSocialLink(editingLinkId, { ...socialForm, id: editingLinkId })
        : await createAdminSocialLink(socialForm)
      setSocialLinks((current) => editingLinkId ? current.map((link) => link.id === editingLinkId ? saved : link) : [...current, saved])
      resetSocialLink()
      setMessage('Social link saved.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save social link.') } finally { setSaving(false) }
  }

  const removeSocialLink = async (id: number) => {
    if (!window.confirm('Delete this social link?')) return
    try {
      await deleteAdminSocialLink(id)
      setSocialLinks((current) => current.filter((link) => link.id !== id))
      if (editingLinkId === id) resetSocialLink()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete social link.') }
  }

  const moveSocialLink = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= socialLinks.length) return
    const next = [...socialLinks]
    const [link] = next.splice(index, 1)
    next.splice(nextIndex, 0, link)
    setSocialLinks(next)
    try {
      await reorderAdminSocialLinks(next.map((item) => item.id!))
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder social links.') }
  }

  const uploadCv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > 8 * 1024 * 1024) { setError('Upload a PDF under 8 MB.'); event.target.value = ''; return }
    try {
      const cv = await uploadAdminCv(file)
      setCvFileName(cv.fileName)
      setMessage('CV uploaded and activated.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to upload CV.') } finally { event.target.value = '' }
  }

  if (loading) return <p className="review-state">Loading settings…</p>

  return (
    <div className="admin-list-page">
      <section className="admin-project-form">
        <div className="admin-form-heading"><div><p className="section-label">SOCIAL LINKS</p><h2>Connect your profiles</h2></div></div>
        <form className="admin-content-row admin-social-form" onSubmit={(event) => { event.preventDefault(); void saveSocialLink(event) }}>
          <select value={socialForm.platform} onChange={(event) => setSocialForm((current) => ({ ...current, platform: event.target.value as SocialLinkInput['platform'] }))} aria-label="Platform">
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
            <option value="telegram">Telegram</option>
            <option value="instagram">Instagram</option>
          </select>
          <input placeholder="Label" value={socialForm.label} onChange={(event) => setSocialForm((current) => ({ ...current, label: event.target.value }))} required />
          <input placeholder="https://..." value={socialForm.url} onChange={(event) => setSocialForm((current) => ({ ...current, url: event.target.value }))} required />
          <button className="admin-text-button" type="submit" disabled={saving}>{editingLinkId ? 'Save link' : 'Add link'}</button>
          {editingLinkId && <button className="admin-text-button" type="button" onClick={resetSocialLink}>Cancel</button>}
        </form>
        {socialLinks.length === 0 && <p className="review-state">No social links yet.</p>}
        {socialLinks.map((link, index) => (
          <article className="admin-project-card" key={link.id ?? link.platform}>
            <div><strong>{link.label}</strong><p>{link.platform} · {link.url}</p></div>
            <div className="admin-review-actions">
              <button type="button" onClick={() => void moveSocialLink(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" onClick={() => void moveSocialLink(index, 1)} disabled={index === socialLinks.length - 1}>↓</button>
              <button type="button" onClick={() => { setEditingLinkId(link.id ?? null); setSocialForm({ platform: link.platform, label: link.label, url: link.url }); setMessage(''); setError('') }}>Edit</button>
              <button type="button" onClick={() => void removeSocialLink(link.id!)}>Delete</button>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-project-form">
        <div className="admin-form-heading"><div><p className="section-label">CV</p><h2>Active resume</h2></div></div>
        <p className="review-state">{cvFileName ? `Active file: ${cvFileName}` : 'No active CV uploaded.'}</p>
        <label className="admin-upload-button">Upload PDF CV<input type="file" accept="application/pdf" onChange={(event) => void uploadCv(event)} /></label>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  )
}

export default AdminSettings
