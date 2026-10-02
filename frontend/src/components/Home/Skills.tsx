import { useEffect, useState } from 'react'
import { getPublicContent } from '../../api/content.api'

const Skills = () => {
  const [groups, setGroups] = useState<Array<{ id: number; title: string; skills: string[] }>>([])
  const [tools, setTools] = useState<Array<{ id: number; name: string; iconUrl: string | null; category: string | null; enabled: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicContent()
      .then((content) => {
        setGroups(content.skills ?? [])
        setTools(content.tools?.filter((t) => t.enabled) ?? [])
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load skills.'))
      .finally(() => setLoading(false))
  }, [])

  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category ?? 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(tool)
    return acc
  }, {} as Record<string, typeof tools>)

  if (!loading && !error && groups.length === 0 && tools.length === 0) return null

  return (
    <section className="skills-section" id="skills">
      <div className="section-header"><p className="section-label">WHAT I USE</p><h2>Skills that <span>ship.</span></h2></div>
      {loading && <p className="review-state">Loading skills...</p>}
      {error && <p className="form-error review-state" role="alert">{error}</p>}
      {!loading && !error && (groups.length > 0 || tools.length > 0) && (
        <div className="skills-grid">
          {groups.map((group) => (
            <article className="skill-group" key={`group-${group.id}`}>
              <span className="skill-group-mark" aria-hidden="true">+</span>
              <h3>{group.title}</h3>
              <div className="skill-list">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
          {Object.entries(groupedTools).map(([category, groupTools]) => (
            <article className="skill-group" key={category}>
              <span className="skill-group-mark" aria-hidden="true">+</span>
              <h3>{category}</h3>
              <div className="skill-list">
                {groupTools.map((tool) => (
                  <span key={tool.id} title={tool.name}>
                    {tool.iconUrl ? (
                      <img src={tool.iconUrl} alt={tool.name} style={{ width: '24px', height: '24px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
                    ) : null}
                    {tool.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Skills
