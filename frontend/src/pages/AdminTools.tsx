import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminTools, createAdminTool, updateAdminTool, reorderAdminTools, deleteAdminTool, type ToolInput } from '../api/admin.api'
import { getAdminSkills } from '../api/admin.api'

const emptyTool: ToolInput = { name: '', enabled: true, sortOrder: 0, skillGroupId: null }

const AdminTools = () => {
  const navigate = useNavigate()
  const [tools, setTools] = useState<ToolInput[]>([])
  const [skillGroups, setSkillGroups] = useState<Array<{ id?: number; title: string; skills: string[] }>>([])
  const [form, setForm] = useState<ToolInput>(emptyTool)
  const [skillGroupSelect, setSkillGroupSelect] = useState<string>('')
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
      const [toolsData, skillsData] = await Promise.all([getAdminTools(), getAdminSkills()])
      if (mountedRef.current) {
        setTools(toolsData)
        setSkillGroups(skillsData)
      }
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load tools.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: keyof ToolInput, value: string | number | boolean | null) => {
    setForm((current: ToolInput) => ({ ...current, [field]: value }))
  }

  const edit = (tool: ToolInput) => {
    setEditingId(tool.id ?? null)
    setForm({ ...tool })
    setSkillGroupSelect(tool.skillGroupId !== null && tool.skillGroupId !== undefined ? String(tool.skillGroupId) : '')
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyTool); setSkillGroupSelect(''); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name) { setError('Tool name is required.'); return }
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = fileInput?.files?.[0]
      if (editingId) {
        await updateAdminTool(editingId, form, file)
        setMessage('Tool updated.')
      } else {
        await createAdminTool(form, file)
        setMessage('Tool created.')
      }
      reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save tool.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this tool?')) return
    try {
      await deleteAdminTool(id)
      setTools((current) => current.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete tool.')
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= tools.length) return
    const next = [...tools]
    const [tool] = next.splice(index, 1)
    next.splice(nextIndex, 0, tool)
    setTools(next)
    try { await reorderAdminTools(next.map((t) => t.id!)) } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reorder tools.') }
  }

  if (loading) return <p className="review-state">Loading tools…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-project-form" onSubmit={submit} encType="multipart/form-data">
        <div className="admin-form-heading">
          <div>
            <p className="section-label">{editingId ? 'EDIT TOOL' : 'NEW TOOL'}</p>
            <h2>{editingId ? 'Update tool' : 'Add a tool'}</h2>
          </div>
          <button className="admin-text-button" type="button" onClick={reset}>Clear</button>
        </div>

        <div className="admin-form-grid">
          <label>Name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required placeholder="e.g., React, TypeScript, Node.js" /></label>

          <label className="admin-form-wide">
            Icon <span className="admin-field-hint">JPG, PNG, WebP, SVG</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" />
          </label>

          <label>Category<input value={form.category ?? ''} onChange={(event) => updateField('category', event.target.value)} placeholder="e.g., Frontend, Backend, Database, DevOps" /></label>

          <label>
            Skill Group
            <select value={skillGroupSelect} onChange={(event) => { setSkillGroupSelect(event.target.value); updateField('skillGroupId', event.target.value ? Number(event.target.value) : null); }}>
              <option value="">None</option>
              {skillGroups.map((group) => <option key={group.id ?? group.title} value={String(group.id)}>{group.title}</option>)}
            </select>
          </label>

          <label>
            Enabled<input type="checkbox" checked={form.enabled} onChange={(event) => updateField('enabled', event.target.checked)} />
          </label>

          <label>
            Sort Order<input type="number" value={form.sortOrder ?? 0} onChange={(event) => updateField('sortOrder', Number(event.target.value))} />
          </label>
        </div>

        {editingId && form.iconUrl && (
          <div style={{ marginTop: '16px' }}>
            <img src={form.iconUrl} alt={form.name} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px', border: '1px solid #333' }} />
          </div>
        )}

        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save tool' : 'Create tool'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list">
        <div className="admin-form-heading">
          <div><p className="section-label">TOOLS</p><h2>Manage tools</h2></div>
        </div>

        {tools.length === 0 && <p className="review-state">No tools yet.</p>}

        {tools.map((tool, index) => (
          <article className="admin-project-card" key={tool.id ?? tool.name}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {tool.iconUrl && <img src={tool.iconUrl} alt={tool.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />}
                <strong>{tool.name}</strong>
              </div>
              <p>{tool.category ?? 'Uncategorized'} · {tool.enabled ? 'Enabled' : 'Disabled'} · Sort: {tool.sortOrder}</p>
            </div>
            <div className="admin-review-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === tools.length - 1}>↓</button>
              <button type="button" onClick={() => edit(tool)}>Edit</button>
              <button type="button" onClick={() => void remove(tool.id!)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default AdminTools