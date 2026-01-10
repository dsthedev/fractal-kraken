import { sendContactEmail as sendContactHelper } from 'src/lib/mailer'
import { mailer } from 'src/lib/mailer'
import { ExampleEmail } from 'src/mail/Example/Example'

// Doesn't work
export const sendExampleEmail = async ({ toEmail }: { toEmail: string }) => {
  await mailer.send(ExampleEmail({ when: new Date().toLocaleString() }), {
    to: toEmail,
    subject: 'Example Email',
    from: process.env.NOREPLY_EMAIL || process.env.BREVO_SENDER_EMAIL,
  })

  return true
}

// Not working or used
export const sendContactEmail = async ({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) => {
  await sendContactHelper({ fromName: name, fromEmail: email, message })
  return true
}
