import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

type NavItem = { label: string; href: string; section: string }

const primaryLinks: NavItem[] = [
  { label: 'HOME', href: '#home', section: 'home' },
  { label: 'WORK', href: '#work', section: 'work' },
  { label: 'ABOUT', href: '#about', section: 'about' },
  { label: 'EXPERIENCE', href: '#experience', section: 'experience' },
  { label: 'EDUCATION', href: '#education', section: 'education' },
  { label: 'SKILLS', href: '#skills', section: 'skills' },
  { label: 'CONTACT', href: '#contact', section: 'contact' },
]

const Navbar = () => {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const sections = primaryLinks
      .map((link) => document.getElementById(link.section))
      .filter((section): section is HTMLElement => section !== null)

    const handleScroll = () => {
      setScrolled(window.scrollY > 24)

      const current = sections.reduce((closest, section) => {
        const distance = Math.abs(section.getBoundingClientRect().top - 130)
        return distance < closest.distance ? { id: section.id, distance } : closest
      }, { id: 'home', distance: Number.POSITIVE_INFINITY })

      setActiveSection(current.id)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sectionHref = (href: string) => location.pathname === '/' ? href : `/${href}`

  return (
    <header ref={headerRef} className={`navbar-shell ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar" aria-label="Main navigation">
        <a href={sectionHref('#home')} className="nav-logo">
          <span className="nav-logo-mark" aria-hidden="true">✦</span>
          ETSUBDINK
        </a>

        <div className="nav-links">
          {primaryLinks.map((link) => (
            <a className={activeSection === link.section ? 'is-active' : ''} href={sectionHref(link.href)} key={link.section}>
              {link.label}
            </a>
          ))}
        </div>

        <a className="nav-cta" href={sectionHref('#contact')}>Let's Talk <span aria-hidden="true">↗</span></a>
      </nav>

      <nav className="mobile-dev-nav" aria-label="Mobile navigation">
        <div className="mobile-dev-nav-track">
          {primaryLinks.map((link, index) => (
            <a
              className={activeSection === link.section ? 'is-active' : ''}
              href={sectionHref(link.href)}
              key={link.section}
              style={{ '--menu-index': index } as React.CSSProperties}
            >
              <span className="dev-nav-number">0{index + 1}</span>
              <span className="dev-nav-label">{link.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
