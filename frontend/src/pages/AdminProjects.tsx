import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAdminProject, deleteAdminProject, deleteAdminProjectImage, getAdminProjects, reorderAdminProjectImages, updateAdminProject, updateAdminProjectPublication, uploadAdminProjectImage, type CmsProject, type CmsProjectInput } from '../api/admin.api'

const emptyProject: CmsProjectInput = {
  title: '', slug: '', category: '', shortDescription: '', overview: '', problem: '', approach: '', solution: '',
  technologies: [], keyFeatures: [], result: '', reflection: '', projectType: '', featured: false, published: false,
  githubUrl: '', liveUrl: '', videoUrl: '', coverImage: '',
}

const splitLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean)
const joinLines = (items: string[]) => items.join('\n')

const AdminProjects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<CmsProject[]>([])
  const [form, setForm] = useState<CmsProjectInput>(emptyProject)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [gallery, setGallery] = useState<CmsProject['galleryImages']>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadProjects = useCallback(async () => {
    try {
      const data = await getAdminProjects()
      if (mountedRef.current) setProjects(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load projects.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadProjects() }, [loadProjects])

  const updateField = (field: keyof CmsProjectInput, value: string | boolean | string[]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const editProject = (project: CmsProject) => {
    setEditingId(project.id)
    setGallery(project.galleryImages)
    setForm({
      title: project.title, slug: project.slug, category: project.category, shortDescription: project.shortDescription,
      overview: project.overview, problem: project.problem, approach: project.approach, solution: project.solution,
      technologies: project.technologies, keyFeatures: project.keyFeatures, result: project.result, reflection: project.reflection,
      projectType: project.projectType, featured: project.featured, published: project.published, githubUrl: project.githubUrl ?? '',
      liveUrl: project.liveUrl ?? '', videoUrl: project.videoUrl ?? '', coverImage: project.coverImage ?? '',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => { setEditingId(null); setGallery([]); setForm(emptyProject); setMessage(''); setError('') }

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingId) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Use a JPG, PNG, or WebP image under 10 MB.')
      event.target.value = ''
      return
    }
    try {
      const image = await uploadAdminProjectImage(editingId, file, `${form.title} screenshot`)
      setGallery((current) => [...current, image])
      setMessage('Image uploaded.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to upload image.')
    } finally {
      event.target.value = ''
    }
  }

  const removeImage = async (imageId: number) => {
    if (!editingId) return
    try {
      await deleteAdminProjectImage(editingId, imageId)
      setGallery((current) => current.filter((image) => image.id !== imageId))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete image.')
    }
  }

  const moveImage = async (imageId: number, direction: -1 | 1) => {
    if (!editingId) return
    const currentIndex = gallery.findIndex((image) => image.id === imageId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= gallery.length) return
    const nextGallery = [...gallery]
    const [image] = nextGallery.splice(currentIndex, 1)
    nextGallery.splice(nextIndex, 0, image)
    setGallery(nextGallery)
    await reorderAdminProjectImages(editingId, nextGallery.map((item) => item.id))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      if (editingId) await updateAdminProject(editingId, form)
      else await createAdminProject(form)
      setMessage(editingId ? 'Project updated.' : 'Project draft created.')
      resetForm()
      await loadProjects()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save project.')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (project: CmsProject) => {
    try {
      await updateAdminProjectPublication(project.id, !project.published)
      await loadProjects()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update publication status.')
    }
  }

  const remove = async (project: CmsProject) => {
    if (!window.confirm(`Delete ${project.title}?`)) return
    try {
      await deleteAdminProject(project.id)
      if (editingId === project.id) resetForm()
      await loadProjects()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete project.')
    }
  }

  return (
    <main className="admin-page admin-projects-page">
      <div className="admin-form-heading"><div><p className="section-label">PROJECTS</p><h2>Case studies & gallery</h2></div></div>

      <form className="admin-project-form" onSubmit={submit}>
        <div className="admin-form-heading"><div><p className="section-label">{editingId ? 'EDIT PROJECT' : 'NEW PROJECT'}</p><h2>{editingId ? 'Update case study' : 'Create a case study'}</h2></div><button className="admin-text-button" type="button" onClick={resetForm}>Clear</button></div>
        <div className="admin-form-grid">
          <label>Title<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></label>
          <label>Slug<input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="project-slug" required /></label>
          <label>Category<input value={form.category} onChange={(event) => updateField('category', event.target.value)} required /></label>
          <label>Project type<input value={form.projectType} onChange={(event) => updateField('projectType', event.target.value)} required /></label>
          <label className="admin-form-wide">Short description<textarea value={form.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} rows={3} required /></label>
          {(['overview', 'problem', 'approach', 'solution', 'result', 'reflection'] as const).map((field) => <label className="admin-form-wide" key={field}>{field[0].toUpperCase() + field.slice(1)}<textarea value={form[field]} onChange={(event) => updateField(field, event.target.value)} rows={4} required /></label>)}
          <label>Technologies <span className="admin-field-hint">one per line</span><textarea value={joinLines(form.technologies)} onChange={(event) => updateField('technologies', splitLines(event.target.value))} rows={5} /></label>
          <label>Key features <span className="admin-field-hint">one per line</span><textarea value={joinLines(form.keyFeatures)} onChange={(event) => updateField('keyFeatures', splitLines(event.target.value))} rows={5} /></label>
          <label>Cover image URL<input value={form.coverImage ?? ''} onChange={(event) => updateField('coverImage', event.target.value)} placeholder="https://..." /></label>
          <label>Video URL<input value={form.videoUrl ?? ''} onChange={(event) => updateField('videoUrl', event.target.value)} placeholder="https://..." /></label>
          <label>GitHub URL<input value={form.githubUrl ?? ''} onChange={(event) => updateField('githubUrl', event.target.value)} /></label>
          <label>Live URL<input value={form.liveUrl ?? ''} onChange={(event) => updateField('liveUrl', event.target.value)} /></label>
        </div>
        <div className="admin-form-options"><label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => updateField('featured', event.target.checked)} /> Featured project</label><label className="admin-checkbox"><input type="checkbox" checked={form.published} onChange={(event) => updateField('published', event.target.checked)} /> Publish immediately</label></div>
        {editingId && <div className="admin-media-manager"><div><p className="section-label">PROJECT GALLERY</p><h3>Images</h3></div><label className="admin-upload-button">Upload image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event)} /></label>{gallery.length === 0 && <p className="review-state">No gallery images yet.</p>}<div className="admin-gallery-grid">{gallery.map((image, index) => <figure key={image.id}><img src={image.url} alt={image.alt ?? ''} /><figcaption><span>#{index + 1}</span><button type="button" onClick={() => void moveImage(image.id, -1)} disabled={index === 0}>←</button><button type="button" onClick={() => void moveImage(image.id, 1)} disabled={index === gallery.length - 1}>→</button><button type="button" onClick={() => void removeImage(image.id)}>Remove</button></figcaption></figure>)}</div></div>}
        <button className="contact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save project' : 'Create project'}</button>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      <section className="admin-project-list"><div className="admin-form-heading"><div><p className="section-label">CONTENT LIBRARY</p><h2>Saved projects</h2></div></div>
        {loading && <p className="review-state">Loading projects...</p>}
        {!loading && projects.length === 0 && <p className="review-state">No CMS projects yet.</p>}
        {projects.map((project) => <article className="admin-project-card" key={project.id}><div><strong>{project.title}</strong><p>{project.category} · {project.slug}</p></div><span className={`review-status ${project.published ? 'review-status-approved' : 'review-status-rejected'}`}>{project.published ? 'PUBLISHED' : 'DRAFT'}</span><div className="admin-review-actions"><button type="button" onClick={() => editProject(project)}>Edit</button><button type="button" onClick={() => void togglePublished(project)}>{project.published ? 'Unpublish' : 'Publish'}</button><button type="button" onClick={() => void remove(project)}>Delete</button></div></article>)}
      </section>
    </main>
  )
}

export default AdminProjects
