import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../api/admin.api'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const signOut = async () => {
    await logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  const navItems = [
    { label: 'Overview', to: '/admin', exact: true },
    { label: 'Profile / About', to: '/admin/profile' },
    { label: 'Projects', to: '/admin/projects' },
    { label: 'Experience', to: '/admin/experience' },
    { label: 'Education', to: '/admin/education' },
    { label: 'Skills', to: '/admin/skills' },
    { label: 'Tools', to: '/admin/tools' },
    { label: 'Audio', to: '/admin/audio' },
    { label: 'Certificates', to: '/admin/certificates' },
    { label: 'Services', to: '/admin/services' },
    { label: 'Reviews', to: '/admin/reviews' },
    { label: 'Settings', to: '/admin/settings' },
  ]

  useEffect(() => {
    document.body.classList.add('admin-shell-open')
    return () => document.body.classList.remove('admin-shell-open')
  }, [])

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__dot" aria-hidden="true" />
          <div>
            <p className="admin-sidebar__eyebrow">PRIVATE CMS</p>
            <h1>Portfolio CMS</h1>
          </div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin sections">
          {navItems.map((item) => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-sidebar__link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button type="button" className="admin-text-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="section-label">PRIVATE CMS</p>
            <h1>{navItems.find((item) => (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label ?? 'Admin'}</h1>
          </div>
          <div className="admin-header-actions">
            <button className="admin-text-button" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  )
}

export default AdminLayout