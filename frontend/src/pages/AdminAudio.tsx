import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminAudio, createAdminAudio, updateAdminAudio, deleteAdminAudio, type AudioInput } from '../api/admin.api'

const emptyAudio: AudioInput = { enabled: true, loop: true, volume: 0.5 }

const AdminAudio = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<AudioInput[]>([])
  const [form, setForm] = useState<AudioInput>(emptyAudio)
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
      const data = await getAdminAudio()
      if (mountedRef.current) setItems(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load audio.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateField = (field: keyof AudioInput, value: string | number | boolean) => {
    setForm((current: AudioInput) => ({ ...current, [field]: value }))
  }

  const edit = (audio: AudioInput) => {
    setEditingId(audio.id ?? null)
    setForm({ ...audio })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setEditingId(null); setForm(emptyAudio); setMessage(''); setError('') }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.fileName && !editingId) { setError('Audio file is required for new entries.'); return }
    setSaving(true)
    setMessage('')
    setError('')
    try {
      if (editingId) {
        await updateAdminAudio(editingId, form)
        setMessage('Audio updated.')
      } else {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (!fileInput?.files?.[0]) { setError('Audio file is required.'); setSaving(false); return }
        await createAdminAudio(fileInput.files[0], { enabled: form.enabled, loop: form.loop, volume: form.volume, sortOrder: form.sortOrder })
        setMessage('Audio created.')
      }
      reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save audio.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this audio?')) return
    try {
      await deleteAdminAudio(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete audio.')
    }
  }

  if (loading) return <p className="review-state">Loading audio…</p>

  return (
    <div className="admin-list-page">
      <form className="admin-project-form" onSubmit={submit} encType="multipart/form-data">
        <div className="admin-form-heading">
          <div>
            <p className="section-label">{editingId ? 'EDIT AUDIO' : 'NEW AUDIO'}</p>
            <h2>{editingId ? 'Update audio' : 'Add audio track'}</h2>
          </div>
          <button className="admin-text-button" type="button" onClick={reset}>Clear</button>
        </div>

        <div className="admin-form-grid">
          {!editingId && (
            <label className="admin-form-wide">
              Audio File <span className="admin-field-hint">MP3, WAV, OGG, WebM</span>
              <input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/webm" required />
            </label>
          )}

          <label>
            File Name<input value={form.fileName} onChange={(event) => updateField('fileName', event.target.value)} placeholder="ambient.mp3" />
          </label>

          <label>
            Enabled<input type="checkbox" checked={form.enabled} onChange={(event) => updateField('enabled', event.target.checked)} />
          </label>

          <label>
            Loop<input type="checkbox" checked={form.loop} onChange={(event) => updateField('loop', event.target.checked)} />
          </label>

          <label>
            Volume<input type="range" min="0" max="1" step="0.1" value={form.volume} onChange={(event) => updateField('volume', Number(event.target.value))} />
          </label>

          <label>
            Sort Order<input type="number" value={form.sortOrder ?? 0} onChange={(event) => updateField('sortOrder', Number(event.target.value))} />
          </label>
        </div>

        {editingId && form.fileName && (
          <div style={{ marginTop: '16px' }}>
            <audio controls style={{ width: '100%', maxWidth: '400px' }}>
              <source src={form.url || form.fileName} type="audio/mpeg" />
            </audio>
          </div>
        )}

        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save audio' : 'Create audio'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list">
        <div className="admin-form-heading">
          <div><p className="section-label">AUDIO</p><h2>Manage audio tracks</h2></div>
        </div>

        {items.length === 0 && <p className="review-state">No audio tracks yet.</p>}

        {items.map((audio) => (
          <article className="admin-project-card" key={audio.id ?? audio.fileName}>
            <div>
              <strong>{audio.fileName}</strong>
              <p>{audio.enabled ? 'Enabled' : 'Disabled'} · Loop: {audio.loop ? 'Yes' : 'No'} · Volume: {Math.round((audio.volume ?? 0.5) * 100)}%</p>
              {audio.url && <audio controls style={{ width: '100%', maxWidth: '300px', marginTop: '8px' }}><source src={audio.url} type="audio/mpeg" /></audio>}
            </div>
            <div className="admin-review-actions">
              <button type="button" onClick={() => edit(audio)}>Edit</button>
              <button type="button" onClick={() => void remove(audio.id!)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default AdminAudio