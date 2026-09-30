import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminEducation, createAdminEducation, updateAdminEducation, reorderAdminEducation, deleteAdminEducation, type EducationInput } from '../api/admin.api'

const emptyEducation: EducationInput = { institution: '', degree: '', startDate: '', endDate: '', description: '' }

const AdminEducation = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<EducationInput[]>([])
  const [form, setForm] = useState<EducationInput>(emptyEducation)
  const [editingId, setEditingId] = useState<number | null>(null)
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
      const data = await getAdminEducation()
      if (mountedRef.current) setItems(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load education.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: keyof EducationInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const edit = (item: EducationInput) => {
    setEditingId(item.id ?? null)
    setForm({ institution: item.institution, degree: item.degree, startDate: item.startDate ?? '', endDate: item.endDate ?? '', description: item.description ?? '' })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyEducation); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.institution || !form.degree) { setError('Institution and degree are required.'); return }
    setSaving(true); setMessage(''); setError('')
    try {
      if (editingId) { await updateAdminEducation(editingId, form); setMessage('Education updated.') }
      else { const created = await createAdminEducation(form); setItems((current) => [...current, created]); setMessage('Education created.') }
      reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save education.') } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this education entry?')) return
    try {
      await deleteAdminEducation(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete education.') }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setItems(next)
    try { await reorderAdminEducation(next.map((entry) => entry.id!)) } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder education.') }
  }

  if (loading) return <p className="review-state">Loading education…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-project-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT EDUCATION' : 'NEW EDUCATION'}</p><h2>{editingId ? 'Update degree' : 'Add education'}</h2></div><button className="admin-text-button" type="button" onClick={reset}>Clear</button></div>
        <div className="admin-form-grid">
          <label>Institution<input value={form.institution} onChange={(event) => updateField('institution', event.target.value)} required /></label>
          <label>Degree<input value={form.degree} onChange={(event) => updateField('degree', event.target.value)} required /></label>
          <label>Start date<input value={form.startDate ?? ''} onChange={(event) => updateField('startDate', event.target.value)} /></label>
          <label>End date<input value={form.endDate ?? ''} onChange={(event) => updateField('endDate', event.target.value)} /></label>
          <label className="admin-form-wide">Description<textarea value={form.description ?? ''} onChange={(event) => updateField('description', event.target.value)} rows={4} /></label>
        </div>
        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save education' : 'Create education'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list">
        <div className="admin-form-heading"><div><p className="section-label">EDUCATION</p><h2>Manage education</h2></div></div>
        {items.length === 0 && <p className="review-state">No education entries yet.</p>}
        {items.map((item, index) => (
          <article className="admin-project-card" key={item.id ?? item.institution}>
            <div><strong>{item.degree}</strong><p>{item.institution} · {item.startDate ?? '—'} → {item.endDate ?? '—'}</p></div>
            <div className="admin-review-actions">
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

export default AdminEducation