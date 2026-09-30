import type { ContactMessage } from '../types/contact'
import nodemailer from 'nodemailer'

const recipient = 'etsubdinkenyew@gmail.com'

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

export const submitContactMessage = async (message: ContactMessage) => {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM } = process.env

  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASSWORD) {
    throw new Error('Contact email delivery is not configured.')
  }

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT ?? 587),
    secure: Number(MAIL_PORT ?? 587) === 465,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"Etsubdink Enyew" <${MAIL_FROM ?? MAIL_USER}>`,
    to: recipient,
    replyTo: message.email,
    subject: `Portfolio Contact: ${message.name}`,
    text: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
    html: `<h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(message.name)}</p><p><strong>Email:</strong> ${escapeHtml(message.email)}</p><p>${escapeHtml(message.message).replace(/\n/g, '<br />')}</p>`,
  })

  return { accepted: true }
}
