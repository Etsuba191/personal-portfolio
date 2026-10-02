import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminExperience, createAdminExperience, updateAdminExperience, reorderAdminExperience, deleteAdminExperience, type ExperienceInput } from '../api/admin.api'

const emptyExperience: ExperienceInput = { organization: '', role: '', division: '', startDate: '', endDate: '', description: '' }

const AdminExperience = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<ExperienceInput[]>([])
  const [form, setForm] = useState<ExperienceInput>(emptyExperience)
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
      const data = await getAdminExperience()
      if (mountedRef.current) setItems(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load experience.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: keyof ExperienceInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const edit = (item: ExperienceInput) => {
    setEditingId(item.id ?? null)
    setForm({ organization: item.organization, role: item.role, division: item.division ?? '', startDate: item.startDate, endDate: item.endDate, description: item.description ?? '' })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyExperience); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.organization || !form.role || !form.startDate || !form.endDate) {
      setError('Organization, role, and dates are required.')
      return
    }
    setSaving(true); setMessage(''); setError('')
    try {
      if (editingId) {
        const updated = await updateAdminExperience(editingId, form)
        setItems((current) => current.map((item) => item.id === editingId ? updated : item))
        reset()
        setMessage('Experience updated.')
      } else {
        const created = await createAdminExperience(form)
        setItems((current) => [...current, created])
        reset()
        setMessage('Experience created.')
      }
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save experience.') } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this experience entry?')) return
    try {
      await deleteAdminExperience(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete experience.') }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setItems(next)
    try {
      await reorderAdminExperience(next.map((entry) => entry.id!))
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder experience.') }
  }

  if (loading) return <p className="review-state">Loading experience…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-project-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT EXPERIENCE' : 'NEW EXPERIENCE'}</p><h2>{editingId ? 'Update role' : 'Add a role'}</h2></div><button className="admin-text-button" type="button" onClick={reset}>Clear</button></div>
        <div className="admin-form-grid">
          <label>Organization<input value={form.organization} onChange={(event) => updateField('organization', event.target.value)} required /></label>
          <label>Role<input value={form.role} onChange={(event) => updateField('role', event.target.value)} required /></label>
          <label>Division<input value={form.division ?? ''} onChange={(event) => updateField('division', event.target.value)} /></label>
          <label>Start date<input value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} placeholder="2020" required /></label>
          <label>End date<input value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} placeholder="Present" required /></label>
          <label className="admin-form-wide">Description<textarea value={form.description ?? ''} onChange={(event) => updateField('description', event.target.value)} rows={4} /></label>
        </div>
        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save experience' : 'Create experience'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list">
        <div className="admin-form-heading"><div><p className="section-label">EXPERIENCE</p><h2>Manage roles</h2></div></div>
        {items.length === 0 && <p className="review-state">No experience entries yet.</p>}
        {items.map((item, index) => (
          <article className="admin-project-card" key={item.id ?? item.organization}>
            <div><strong>{item.role}</strong><p>{item.organization}{item.division ? ` · ${item.division}` : ''} · {item.startDate} → {item.endDate}</p></div>
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

export default AdminExperience