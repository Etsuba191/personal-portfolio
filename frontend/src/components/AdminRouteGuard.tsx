import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { getAdminSession } from '../api/admin.api'
import AdminLayout from './AdminLayout'

const AdminRouteGuard = () => {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let active = true
    getAdminSession()
      .then(() => {
        if (active) setAuthenticated(true)
      })
      .catch(() => {
        if (active) {
          setAuthenticated(false)
          navigate('/admin/login', { replace: true })
        }
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => {
      active = false
    }
  }, [navigate])

  if (checking) {
    return (
      <main className="admin-page">
        <p className="review-state">Checking admin session…</p>
      </main>
    )
  }

  if (!authenticated) {
    return null
  }

  return <AdminLayout><Outlet /></AdminLayout>
}

export default AdminRouteGuard