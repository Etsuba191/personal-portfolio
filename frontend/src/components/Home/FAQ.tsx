import { useState } from 'react'

const faqs = [
  {
    question: 'What technologies do you work with?',
    answer:
      'I mainly work with React, TypeScript, JavaScript, Node.js, Express, Prisma, MySQL, PostgreSQL, Tailwind CSS, Git, and REST APIs.',
  },
  {
    question: 'Do you build full-stack applications?',
    answer:
      'Yes. I can work across the frontend, backend, APIs, and database of a web application.',
  },
  {
    question: 'Are you available for projects?',
    answer:
      "I'm open to opportunities where I can contribute, learn, and build useful products.",
  },
  {
    question: 'Can we work together remotely?',
    answer:
      "Yes. I'm comfortable collaborating remotely using modern development and communication tools.",
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section" id="faq">
      <div className="faq-header">
        <p className="section-label">FAQ</p>

        <h2>
          Questions?
          <span>Let's answer them.</span>
        </h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index

          return (
            <article className="faq-item" key={faq.question}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span>{faq.question}</span>

                <span className={isOpen ? 'faq-icon open' : 'faq-icon'}>
                  +
                </span>
              </button>

              <div
                className={`faq-answer-shell ${isOpen ? 'is-open' : ''}`}
                id={`faq-answer-${index}`}
                aria-hidden={!isOpen}
              >
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default FAQ