import type { Request, Response } from 'express'
import { submitContactMessage } from '../services/contact.service'
import type { ContactMessage } from '../types/contact'

export const submitContact = async (req: Request, res: Response) => {
  const { name, email, message } = req.body as Partial<ContactMessage>

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    name.trim().length < 2 ||
    !/^\S+@\S+\.\S+$/.test(email.trim()) ||
    message.trim().length < 10
  ) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid name, email, and message.',
    })
    return
  }

  try {
    const result = await submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    })

    res.status(202).json({ success: true, data: result })
  } catch (error) {
    console.error('Contact email delivery failed', error)
    res.status(503).json({
      success: false,
      message: 'Your message could not be sent right now. Please email me directly.',
    })
  }
}
