import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminCertificates, createAdminCertificate, updateAdminCertificate, replaceAdminCertificateFile, reorderAdminCertificates, deleteAdminCertificate, type CertificateInput } from '../api/admin.api'

const emptyCertificate = { title: '', issuer: '', issueDate: '', credentialUrl: '', file: null }

const AdminCertificates = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<CertificateInput[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<{ title: string; issuer: string; issueDate: string; credentialUrl: string; file: File | null }>(emptyCertificate)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await getAdminCertificates()
      if (mountedRef.current) setItems(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load certificates.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const edit = (item: CertificateInput) => {
    setEditingId(item.id ?? null)
    setForm({ title: item.title, issuer: item.issuer, issueDate: item.issueDate ?? '', credentialUrl: item.credentialUrl ?? '', file: null })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyCertificate); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title || !form.issuer) { setError('Title and issuer are required.'); return }
    if (!editingId && !form.file) { setError('Title, issuer, and certificate file are required.'); return }
    setSaving(true); setMessage(''); setError('')
    try {
      if (editingId) {
        const savedFile = form.file ? await replaceAdminCertificateFile(editingId, form.file) : null
        const updated = await updateAdminCertificate(editingId, { title: form.title, issuer: form.issuer, issueDate: form.issueDate, credentialUrl: form.credentialUrl })
        setItems((current) => current.map((item) => item.id === editingId ? { ...item, ...updated.data, ...(savedFile ? savedFile.data : {}) } : item))
        setMessage(form.file ? 'Certificate file and details updated.' : 'Certificate updated.')
      } else {
        if (!form.file) return
        const created = await createAdminCertificate({ title: form.title, issuer: form.issuer, issueDate: form.issueDate, credentialUrl: form.credentialUrl }, form.file)
        setItems((current) => [...current, created])
        setMessage('Certificate uploaded.')
      }
      reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save certificate.') } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this certificate permanently?')) return
    try {
      await deleteAdminCertificate(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete certificate.') }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setItems(next)
    try { await reorderAdminCertificates(next.map((entry) => entry.id!)) } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder certificates.') }
  }

  if (loading) return <p className="review-state">Loading certificates…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-certificate-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT CERTIFICATE' : 'NEW CERTIFICATE'}</p><h2>{editingId ? 'Update credential' : 'Upload credential'}</h2></div><button className="admin-text-button" type="button" onClick={reset}>Clear</button></div>
        <label>Title<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></label>
        <label>Issuer<input value={form.issuer} onChange={(event) => updateField('issuer', event.target.value)} required /></label>
        <label>Issue date<input value={form.issueDate} onChange={(event) => updateField('issueDate', event.target.value)} placeholder="2026" /></label>
        <label>Credential URL<input value={form.credentialUrl} onChange={(event) => updateField('credentialUrl', event.target.value)} /></label>
        <label className="admin-upload-button">{editingId ? 'Replace file (optional)' : 'Choose PDF or image'}<input name="certificate" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))} /></label>
        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save certificate' : 'Upload certificate'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-certificate-list">
        <div className="admin-form-heading"><div><p className="section-label">CERTIFICATES</p><h2>Manage credentials</h2></div></div>
        {items.length === 0 && <p className="review-state">No certificates yet.</p>}
        {items.map((item, index) => (
          <article className="admin-certificate-row" key={item.id ?? item.title}>
            <div><strong>{item.title}</strong><p>{item.issuer}{item.issueDate ? ` · ${item.issueDate}` : ''}</p></div>
            <div className="admin-review-actions">
              <a href={item.fileUrl} target="_blank" rel="noreferrer">View ↗</a>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</button>
              <button type="button" onClick={() => edit(item)}>Edit</button>
              <button type="button" onClick={() => void remove(item.id!) }>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default AdminCertificates