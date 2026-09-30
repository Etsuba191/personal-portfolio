const processSteps = [
  ['01', 'Understand', 'Understand the problem, people, and requirements before choosing a solution.'],
  ['02', 'Plan', 'Define the structure, user flow, and technical approach.'],
  ['03', 'Build', 'Develop the interface, backend, and functionality with care.'],
  ['04', 'Test', 'Check usability, responsiveness, and functionality across real conditions.'],
  ['05', 'Improve', 'Iterate on what can be clearer, faster, and more useful.'],
]

const Process = () => {
  return (
    <section className="process-section" id="process">
      <div className="section-header">
        <p className="section-label">HOW I WORK</p>
        <h2>
          From idea
          <span>to useful.</span>
        </h2>
      </div>

      <div className="process-list">
        {processSteps.map(([number, title, description]) => (
          <article className="process-step" key={number}>
            <span className="process-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="process-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Process
