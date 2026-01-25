import nodemailer from 'nodemailer'

import { Mailer } from '@cedarjs/mailer-core'
import { NodemailerMailHandler } from '@cedarjs/mailer-handler-nodemailer'
import { StudioMailHandler } from '@cedarjs/mailer-handler-studio'
import { ReactEmailRenderer } from '@cedarjs/mailer-renderer-react-email'

import { logger } from 'src/lib/logger'

const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'http://localhost:8910'

function createBrevoTransport() {
  const host = process.env.BREVO_SMTP_URL || 'localhost'
  const port = Number(process.env.BREVO_SMTP_PORT || 587)
  const authUser = process.env.BREVO_SENDER_EMAIL
  const authPass = process.env.BREVO_SMTP_KEY

  const transportOptions: any = {
    host,
    port,
    secure: port === 465,
  }

  if (authUser && authPass) {
    transportOptions.auth = { user: authUser, pass: authPass }
  }

  return nodemailer.createTransport(transportOptions)
}

export const nodemailerTransport = createBrevoTransport()

export const nodemailerHandler = new NodemailerMailHandler({
  transport: nodemailerTransport,
})

export const studioHandler = new StudioMailHandler()

export const mailer = new Mailer({
  handling: {
    handlers: {
      nodemailer: nodemailerHandler,
      studio: studioHandler,
    },
    default: 'nodemailer',
  },

  rendering: {
    renderers: {
      reactEmail: new ReactEmailRenderer(),
    },
    default: 'reactEmail',
  },

  development: {
    when: process.env.NODE_ENV !== 'production',
    handler: 'studio',
  },

  logger,
})

const DEFAULT_FROM =
  process.env.BREVO_SENDER_EMAIL ||
  `no-reply@${process.env.PROJECT_DOMAIN || 'localhost'}`

// Custom email transport functions
export const sendResetPasswordEmail = async ({
  toEmail,
  resetToken,
}: {
  toEmail: string
  resetToken: string
}) => {
  const resetUrl = `${BASE_URL}/reset-password?resetToken=${encodeURIComponent(resetToken)}`

  return nodemailerTransport.sendMail({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: `Reset Your Password - ${process.env.PROJECT}`,
    text: `Reset your password by clicking the link: ${resetUrl}`,
    html: `<p>Reset your password by clicking the link: <a href="${resetUrl}">${resetUrl}</a></p>`,
  })
}

export const sendContactEmail = async ({
  fromName,
  fromEmail,
  message,
}: {
  fromName: string
  fromEmail: string
  message: string
}) => {
  const subject = `Contact form: ${fromName}`
  const html = `<p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p><p><strong>Message:</strong></p><p>${String(message).replace(/\n/g, '<br/>')}</p>`

  return nodemailerTransport.sendMail({
    from: DEFAULT_FROM,
    to: process.env.CONTACT_RECEIVER_EMAIL || DEFAULT_FROM,
    subject,
    text: `From: ${fromName} <${fromEmail}>\n\n${message}`,
    html,
  })
}
