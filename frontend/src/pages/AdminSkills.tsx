import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminSkills, createAdminSkill, updateAdminSkill, reorderAdminSkills, deleteAdminSkill, type SkillGroupInput } from '../api/admin.api'

const emptyGroup: SkillGroupInput = { title: '', skills: [] }

const AdminSkills = () => {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<SkillGroupInput[]>([])
  const [form, setForm] = useState<SkillGroupInput>(emptyGroup)
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
      const data = await getAdminSkills()
      if (mountedRef.current) setGroups(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load skills.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: keyof SkillGroupInput, value: string | string[]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const edit = (group: SkillGroupInput) => {
    setEditingId(group.id ?? null)
    setForm({ title: group.title, skills: group.skills })
    setMessage(''); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyGroup); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title) { setError('Skill group title is required.'); return }
    setSaving(true); setMessage(''); setError('')
    try {
      if (editingId) { await updateAdminSkill(editingId, form); setMessage('Skill group updated.') }
      else { const created = await createAdminSkill(form); setGroups((current) => [...current, created]); setMessage('Skill group created.') }
      reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save skills.') } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this skill group?')) return
    try {
      await deleteAdminSkill(id)
      setGroups((current) => current.filter((group) => group.id !== id))
      if (editingId === id) reset()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete skill group.') }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= groups.length) return
    const next = [...groups]
    const [group] = next.splice(index, 1)
    next.splice(nextIndex, 0, group)
    setGroups(next)
    try { await reorderAdminSkills(next.map((entry) => entry.id!)) } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder skills.') }
  }

  if (loading) return <p className="review-state">Loading skills…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-project-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT SKILL GROUP' : 'NEW SKILL GROUP'}</p><h2>{editingId ? 'Update skills' : 'Add a skill group'}</h2></div><button className="admin-text-button" type="button" onClick={reset}>Clear</button></div>
        <div className="admin-form-grid">
          <label>Title<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></label>
          <label className="admin-form-wide">Skills <span className="admin-field-hint">one per line</span><textarea value={form.skills.join('\n')} onChange={(event) => updateField('skills', event.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} rows={5} /></label>
        </div>
        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save skills' : 'Create skill group'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list">
        <div className="admin-form-heading"><div><p className="section-label">SKILLS</p><h2>Manage skill groups</h2></div></div>
        {groups.length === 0 && <p className="review-state">No skill groups yet.</p>}
        {groups.map((group, index) => (
          <article className="admin-project-card" key={group.id ?? group.title}>
            <div><strong>{group.title}</strong><p>{group.skills.length} skill(s)</p></div>
            <div className="admin-review-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === groups.length - 1}>↓</button>
              <button type="button" onClick={() => edit(group)}>Edit</button>
              <button type="button" onClick={() => void remove(group.id!) }>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default AdminSkills