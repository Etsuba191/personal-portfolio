import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminServices, saveAdminServices, type ServiceInput } from '../api/admin.api'

const emptyService: ServiceInput = { number: '00', icon: '✦', title: '', description: '' }

const AdminServices = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceInput[]>([])
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
      const data = await getAdminServices()
      if (mountedRef.current) setServices(data)
    } catch (requestError) {
      if (!mountedRef.current) return
      if (requestError instanceof Error && requestError.message.includes('authentication')) navigate('/admin/login', { replace: true })
      else setError(requestError instanceof Error ? requestError.message : 'Unable to load services.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [navigate])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const updateService = (index: number, field: keyof ServiceInput, value: string) => {
    setServices((current) => current.map((service, itemIndex) => itemIndex === index ? { ...service, [field]: value } : service))
  }

  const addService = () => {
    setServices((current) => [...current, { ...emptyService, number: String(current.length + 1).padStart(2, '0') }])
  }

  const removeService = (index: number) => {
    setServices((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const save = async () => {
    setSaving(true); setMessage(''); setError('')
    try {
      const saved = await saveAdminServices(services)
      setServices(saved)
      setMessage('Services saved.')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save services.') } finally { setSaving(false) }
  }

  if (loading) return <p className="review-state">Loading services…</p>

  return (
    <div className="admin-list-page">
      <div className="admin-form-heading"><div><p className="section-label">SERVICES</p><h2>Manage services</h2></div><div className="admin-header-actions"><button className="admin-text-button" type="button" onClick={addService}>Add service</button><button className="contact-button" type="button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save services'}</button></div></div>
      {services.length === 0 && <p className="review-state">No services yet. Add one to get started.</p>}
      {services.map((service, index) => (
        <div className="admin-content-row" key={`${service.number}-${index}`}>
          <input placeholder="Number" value={service.number} onChange={(event) => updateService(index, 'number', event.target.value)} />
          <input placeholder="Icon" value={service.icon} onChange={(event) => updateService(index, 'icon', event.target.value)} />
          <input placeholder="Title" value={service.title} onChange={(event) => updateService(index, 'title', event.target.value)} />
          <textarea placeholder="Description" rows={2} value={service.description} onChange={(event) => updateService(index, 'description', event.target.value)} />
          <button className="admin-text-button" type="button" onClick={() => removeService(index)}>Remove</button>
        </div>
      ))}
      {message && <p className="form-success" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}

export default AdminServices