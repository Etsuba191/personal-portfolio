import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FaGithub, FaInstagram, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'
import { getPublicContent } from '../../api/content.api'
import { submitContactMessage } from '../../api/contact.api'
import type { PublicContent } from '../../api/content.api'

const socialIcons: Record<string, typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  telegram: FaTelegramPlane,
  instagram: FaInstagram,
}

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<PublicContent['profile']>(null)
  const [socialLinks, setSocialLinks] = useState<PublicContent['socialLinks']>([])

  useEffect(() => {
    getPublicContent()
      .then((content) => { setProfile(content.profile); setSocialLinks(content.socialLinks ?? []) })
      .catch(() => undefined)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
      setStatus('error')
      setError('Please enter your name, a valid email, and a message of at least 10 characters.')
      return
    }
    try {
      setStatus('sending')
      await submitContactMessage(form)
      setForm({ name: '', email: '', message: '' })
      setStatus('success')
    } catch (submissionError) {
      setStatus('error')
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to send your message.')
    }
  }

  const email = profile?.email || 'etsubdinkenyew@gmail.com'

  return (
    <section className="contact-section" id="contact">
      <div className="contact-content">
        <p className="section-label">GET IN TOUCH</p>
        <h2>Have an idea? <span>Let's build it.</span></h2>
        <p className="contact-description">Have a project, idea, or opportunity you'd like to discuss? I'd love to hear about it.</p>
        <div className="contact-layout">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label>Name<input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" required /></label>
            <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label>
            <label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell me about the idea" rows={4} required /></label>
            <button className="contact-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send message ↗'}</button>
            {status === 'success' && <p className="form-success" role="status">Thanks. Your message has been received.</p>}
            {status === 'error' && <p className="form-error" role="alert">{error}</p>}
          </form>
          <aside className="contact-direct">
            <p className="section-label">DIRECT CONTACT</p>
            <a href={`mailto:${email}`}>{email}</a>
            {profile?.phone && <p>{profile.phone}</p>}
            <p>Find me online or send a direct message about your project.</p>
            <div className="social-links" aria-label="Social links">
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.platform]
                return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>{Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true">↗</span>}</a>
              })}
              <a className="social-email" href={`mailto:${email}`} aria-label="Email Etsubdink"><HiOutlineMail aria-hidden="true" /></a>
            </div>
          </aside>
        </div>
      </div>
      <footer className="footer"><span>@2026 Etsubdink Enyew</span><div className="footer-links"><a href="#home">Home</a><a href="#work">Work</a><a href="#services">Services</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></div></footer>
    </section>
  )
}

export default ContactSection
