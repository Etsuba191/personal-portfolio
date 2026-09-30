import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../api/admin.api'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginAdmin(email, password)
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={submit}>
        <p className="section-label">PRIVATE CMS</p>
        <h1>Admin sign in</h1>
        <p>Manage your portfolio content and testimonials.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
        <button className="contact-button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in ↗'}</button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </main>
  )
}

export default AdminLogin