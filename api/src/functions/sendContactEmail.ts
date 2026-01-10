import type { APIGatewayProxyEvent, Context } from 'aws-lambda'

import { sendContactEmail } from 'src/lib/mailer'

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { name, email, message } = body

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'name, email and message are required' }),
      }
    }

    await sendContactEmail({ fromName: name, fromEmail: email, message })

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    }
  } catch (error) {
    console.error('Error in sendContactEmail:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send contact email' }),
    }
  }
}
