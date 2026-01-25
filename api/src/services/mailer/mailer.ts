import { renderAsync } from '@react-email/render'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'
import {
  sendContactEmail as sendContactHelper,
  mailer,
  nodemailerTransport,
} from 'src/lib/mailer'
import { EstimateEmail } from 'src/mail/EstimateEmail/EstimateEmail'
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

export const sendEstimateEmail = async ({
  estimateId,
  recipientEmail,
}: {
  estimateId: number
  recipientEmail: string
}) => {
  const estimate = await db.estimate.findFirst({
    where: {
      id: estimateId,
      authorId: context.currentUser?.id,
    },
    include: {
      clientEntity: true,
      installerEntity: true,
      billableItems: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          unit: true,
          action: true,
          material: true,
        },
      },
    },
  })

  if (!estimate) {
    throw new Error('Estimate not found')
  }

  const baseUrl = process.env.PUBLIC_BASE_URL ?? 'http://localhost:8910'
  const estimateLink = `${baseUrl}/estimate/${estimate.id}`

  const billableItems = (estimate.billableItems || []).map((item) => {
    const actionName = item.action?.name || ''
    const materialName = item.material?.name || ''
    const description = [actionName, materialName].filter(Boolean).join(' ')

    return {
      quantity: Number(item.quantity ?? 0),
      unitShortName: item.unit?.shortName || item.unit?.fullName || '',
      description: description.trim() || 'Item',
      unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
      subtotal: item.subtotal ? Number(item.subtotal) : undefined,
    }
  })

  const itemsTotal = billableItems.reduce(
    (sum, it) => sum + Number(it.subtotal ?? 0),
    0
  )

  // React Email + Tailwind can suspend during render; use renderAsync
  const emailNode = EstimateEmail({
    contractorName: estimate.installerEntity?.name || 'Your Contractor',
    estimateTitle: estimate.title || 'Untitled Estimate',
    clientName: estimate.clientEntity?.name || 'Valued Client',
    estimateLink,
    installer: estimate.installerEntity || undefined,
    billableItems,
    total: Number(estimate.total ?? itemsTotal),
  })

  const [htmlContent, textContent] = await Promise.all([
    renderAsync(emailNode),
    renderAsync(emailNode, { plainText: true }),
  ])

  await nodemailerTransport.sendMail({
    to: recipientEmail,
    from: process.env.BREVO_SENDER_EMAIL || process.env.NOREPLY_EMAIL,
    subject: `${estimate.installerEntity?.name || 'Your Contractor'} - Estimate: ${
      estimate.title || 'Untitled Estimate'
    }`,
    html: htmlContent,
    text: textContent,
  })

  // Update estimate status to SENT if it's still in DRAFT
  if (estimate.status === 'DRAFT') {
    await db.estimate.update({
      where: { id: estimateId },
      data: { status: 'SENT' },
    })
  }

  return true
}
