import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getPublicContent } from '../../api/content.api'

const fallbackTechnologies = [
  { id: 0, name: 'React', symbol: 'R', className: 'tech-react', iconUrl: null },
  { id: 1, name: 'TypeScript', symbol: 'TS', className: 'tech-ts', iconUrl: null },
  { id: 2, name: 'JavaScript', symbol: 'JS', className: 'tech-js', iconUrl: null },
  { id: 3, name: 'Node.js', symbol: 'N', className: 'tech-node', iconUrl: null },
  { id: 4, name: 'Express', symbol: 'EX', className: 'tech-express', iconUrl: null },
  { id: 5, name: 'Prisma', symbol: 'P', className: 'tech-prisma', iconUrl: null },
  { id: 6, name: 'PostgreSQL', symbol: 'PG', className: 'tech-postgres', iconUrl: null },
  { id: 7, name: 'Tailwind CSS', symbol: 'TW', className: 'tech-tailwind', iconUrl: null },
  { id: 8, name: 'Git', symbol: '◆', className: 'tech-git', iconUrl: null },
  { id: 9, name: 'REST APIs', symbol: 'API', className: 'tech-api', iconUrl: null },
]

const Hero = () => {
  const [cvUrl, setCvUrl] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profile, setProfile] = useState<{ name: string | null; professionalTitle: string | null; shortIntroduction: string | null } | null>(null)
  const [tools, setTools] = useState<Array<{ id: number; name: string; iconUrl: string | null; symbol: string; className: string }>>([])

  useEffect(() => {
    void getPublicContent()
      .then((content) => {
        setProfile(content.profile)
        setCvUrl(content.cv?.url ?? '')
        setProfileImage(content.about?.profileImage ?? '')
        if (content.tools && content.tools.length > 0) {
          setTools(content.tools.filter((t) => t.enabled).map((tool) => ({
            id: tool.id,
            name: tool.name,
            iconUrl: tool.iconUrl,
            symbol: tool.name.slice(0, 3).toUpperCase(),
            className: `tech-${tool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          })))
        }
      })
      .catch(() => undefined)
  }, [])

  const displayName = profile?.name?.split(' ')[0] || 'there'
  const displayRole = profile?.professionalTitle || 'Full-Stack Developer'
  const displayIntroduction = profile?.shortIntroduction || 'I build digital experiences that solve real problems.'
  const displayTechnologies = tools.length > 0 ? tools : fallbackTechnologies

  return (
    <section className="codecraft-hero" id="home">
      <div className="hero-dot-grid" aria-hidden="true" />
      <div className="codecraft-content">
        <div className="codecraft-copy">
          <p className="hero-badge"><span aria-hidden="true" /> I'M A {displayRole.toUpperCase()}</p>
          <h1>
            Hi, I'm <span>{displayName}</span>
            <strong>{displayIntroduction}</strong>
          </h1>
          <p className="hero-description">
            I work across the frontend and backend, with a focus on clean code, responsive interfaces, and useful user experiences.
          </p>
          <div className="hero-actions">
            <a className="hero-primary-action" href="#work">View My Work <span aria-hidden="true">↗</span></a>
            {cvUrl && <a className="hero-secondary-action" href={cvUrl} download>Download CV <span aria-hidden="true">↓</span></a>}
          </div>
          <div className="tech-stack">
            <p>TECHNOLOGIES I WORK WITH</p>
            <div className="tech-list">
              {displayTechnologies.map((technology, index) => (
                <span
                  className={`tech-icon ${technology.className}`}
                  key={technology.id ?? technology.name}
                  title={technology.name}
                  style={{ '--tech-index': index } as CSSProperties}
                >
                  {technology.iconUrl ? (
                    <img src={technology.iconUrl} alt={technology.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    technology.symbol
                  )}
                </span>
              ))}
            </div>
            <p className="tech-note">And I like learning new technologies when a project calls for them.</p>
          </div>
        </div>
        <div className="codecraft-visual">
          <div className="portrait-glow" aria-hidden="true" />
          <div className="portrait-wrap">
            <img src={profileImage || '/images/graduation.jpg'} alt={`${displayName}, ${displayRole}`} className="hero-portrait" width="410" height="530" fetchPriority="high" decoding="async" />
          </div>
          <div className="hero-code-card">
            <span className="code-status" aria-label="Available online" />
            <pre>{`const developer = {
  name: '${profile?.name ?? displayName}',
  role: '${displayRole}',
  focus: ['Web Applications', 'UI/UX', 'APIs'],
  passion: 'turning ideas into useful products'
}`}</pre>
          </div>
          <span className="hero-squiggle" aria-hidden="true">↝</span>
        </div>
      </div>
    </section>
  )
}

export default Hero
