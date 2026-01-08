import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_URL,
  port: Number(process.env.BREVO_SMTP_PORT),
  auth: {
    user: process.env.BREVO_SENDER_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
})

const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'http://localhost:8910'

export const sendResetPasswordEmail = async ({
  toEmail,
  resetToken,
}: {
  toEmail: string
  resetToken: string
}) => {
  const resetUrl = `${BASE_URL}/reset-password?resetToken=${encodeURIComponent(
    resetToken
  )}`

  return transporter.sendMail({
    from: process.env.NOREPLY_EMAIL,
    to: toEmail,
    subject: `Reset Your Password - ${process.env.PROJECT}`,
    text: `Reset your password by clicking the link: ${resetUrl}`,
    html: `<p>Reset your password by clicking the link: <a href="${resetUrl}">${resetUrl}</a></p>`,
  })
}
