import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import About from './pages/About'
import Contact from './pages/Contact'
import ProjectDetail from './pages/ProjectDetail'
import Navbar from './components/Navbar'
import AudioPlayer from './components/Home/AudioPlayer'
import AdminLogin from './pages/AdminLogin'
import AdminRouteGuard from './components/AdminRouteGuard'
import AdminOverview from './pages/AdminOverview'
import AdminProjects from './pages/AdminProjects'
import AdminProfile from './pages/AdminProfile'
import AdminExperience from './pages/AdminExperience'
import AdminEducation from './pages/AdminEducation'
import AdminSkills from './pages/AdminSkills'
import AdminTools from './pages/AdminTools'
import AdminAudio from './pages/AdminAudio'
import AdminCertificates from './pages/AdminCertificates'
import AdminServices from './pages/AdminServices'
import AdminReviews from './pages/AdminReviews'
import AdminSettings from './pages/AdminSettings'

const AppShell = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <AudioPlayer />}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRouteGuard />} >
          <Route index element={<AdminOverview />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="experience" element={<AdminExperience />} />
          <Route path="education" element={<AdminEducation />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="tools" element={<AdminTools />} />
          <Route path="audio" element={<AdminAudio />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App