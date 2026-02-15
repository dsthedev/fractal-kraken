# Email Invoice Implementation - Step by Step Instructions

## Overview
This implementation will create an email template for invoices and add functionality to send invoices from the edit page, automatically updating the status to "SENT".

---

## Step 1: Create Email Template for Invoice

### 1.1 Create the Template File
Create a new file for the invoice email template using CedarJS mailer conventions.

````typescript
// filepath: api/src/mail/Invoice/Invoice.tsx
import { Hr, Section, Text, Row, Column } from '@react-email/components'
import React from 'react'

interface InvoiceEmailProps {
  invoice: {
    id: string
    invoiceNumber: string
    createdAt: string
    dueDate: string
    status: string
    total: number
    subtotal: number
    taxRate: number
    taxAmount: number
    notes?: string
    job: {
      client: {
        name: string
        email: string
        phone?: string
        address?: string
      }
    }
    user: {
      name: string
      email: string
      phone?: string
    }
    invoiceLineItems: Array<{
      description: string
      quantity: number
      rate: number
      amount: number
    }>
  }
}

export const InvoiceEmail = ({ invoice }: InvoiceEmailProps) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        Invoice {invoice.invoiceNumber}
      </h1>

      <Section>
        <Row>
          <Column style={{ width: '50%' }}>
            <h3>From:</h3>
            <Text>{invoice.user.name}</Text>
            <Text>{invoice.user.email}</Text>
            {invoice.user.phone && <Text>{invoice.user.phone}</Text>}
          </Column>
          <Column style={{ width: '50%' }}>
            <h3>Bill To:</h3>
            <Text>{invoice.job.client.name}</Text>
            <Text>{invoice.job.client.email}</Text>
            {invoice.job.client.phone && <Text>{invoice.job.client.phone}</Text>}
            {invoice.job.client.address && <Text>{invoice.job.client.address}</Text>}
          </Column>
        </Row>
      </Section>

      <Hr style={{ margin: '20px 0', borderTop: '1px solid #ddd' }} />

      <Section>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text><strong>Invoice Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={{ margin: '20px 0', borderTop: '1px solid #ddd' }} />

      <h3>Line Items</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoiceLineItems.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{item.description}</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>${item.rate.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Text style={{ fontSize: '16px' }}>
          <strong>Subtotal:</strong> ${invoice.subtotal.toFixed(2)}
        </Text>
        <Text style={{ fontSize: '16px' }}>
          <strong>Tax ({(invoice.taxRate * 100).toFixed(2)}%):</strong> ${invoice.taxAmount.toFixed(2)}
        </Text>
        <Hr style={{ margin: '10px 0', borderTop: '1px solid #333' }} />
        <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
          Total: ${invoice.total.toFixed(2)}
        </Text>
      </div>

      {invoice.notes && (
        <>
          <Hr style={{ margin: '20px 0' }} />
          <Section>
            <h3>Notes</h3>
            <Text>{invoice.notes}</Text>
          </Section>
        </>
      )}

      <Hr style={{ margin: '30px 0' }} />
      <Text style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        Thank you for your business!
      </Text>
    </div>
  )
}
````

---

## Step 2: Update GraphQL Schema

### 2.1 Add sendInvoice Mutation
Add the mutation to the Invoice SDL.

````typescript
// filepath: api/src/graphql/invoices.sdl.ts
// ...existing code...
  type Mutation {
    createInvoice(input: CreateInvoiceInput!): Invoice! @requireAuth
    updateInvoice(id: String!, input: UpdateInvoiceInput!): Invoice!
      @requireAuth
    deleteInvoice(id: String!): Invoice! @requireAuth
    sendInvoice(id: String!, recipientEmail: String!): Invoice! @requireAuth
  }
// ...existing code...
````

---

## Step 3: Create Email Service Function

### 3.1 Add sendInvoiceEmail Function
Create a function in the invoices service to send the email.

````typescript
// filepath: api/src/services/invoices/invoices.ts
// ...existing code...
import { mailer } from 'src/lib/mailer'
import { InvoiceEmail } from 'src/mail/Invoice/Invoice'

// ...existing code...

export const sendInvoice = async ({
  id,
  recipientEmail,
}: {
  id: string
  recipientEmail: string
}) => {
  // Fetch full invoice with relations
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          client: true,
        },
      },
      user: true,
      invoiceLineItems: true,
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipientEmail)) {
    throw new Error('Invalid email address')
  }

  // Send email using CedarJS mailer
  await mailer.send({
    to: recipientEmail,
    subject: `Invoice ${invoice.invoiceNumber}`,
    react: <InvoiceEmail invoice={invoice} />,
  })

  // Update invoice status to SENT
  const updatedInvoice = await db.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
    },
  })

  return updatedInvoice
}
````

---

## Step 4: Update Frontend Invoice Edit Page

### 4.1 Add Email Selection Dropdown and Send Button
Update the EditInvoicePage to include email recipient selection and send functionality.

````typescript
// filepath: web/src/pages/Invoice/EditInvoicePage/EditInvoicePage.tsx
// ...existing code...
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { navigate, routes } from '@cedarjs/router'
import { toast } from '@cedarjs/web/toast'

const SEND_INVOICE_MUTATION = gql`
  mutation SendInvoiceMutation($id: String!, $recipientEmail: String!) {
    sendInvoice(id: $id, recipientEmail: $recipientEmail) {
      id
      status
    }
  }
`

// ...existing code...

const EditInvoice = ({ invoice }: CellSuccessProps<EditInvoiceById>) => {
  const [selectedEmail, setSelectedEmail] = useState<string>('')
  const [isSending, setIsSending] = useState(false)

  const [sendInvoice] = useMutation(SEND_INVOICE_MUTATION, {
    onCompleted: () => {
      toast.success('Invoice sent successfully')
      navigate(routes.invoices())
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSending(false)
    },
  })

  // Collect valid email addresses
  const emailOptions: Array<{ value: string; label: string }> = []

  if (invoice.job?.client?.email) {
    emailOptions.push({
      value: invoice.job.client.email,
      label: `Client: ${invoice.job.client.email}`,
    })
  }

  if (invoice.user?.email) {
    emailOptions.push({
      value: invoice.user.email,
      label: `Installer: ${invoice.user.email}`,
    })
  }

  const handleSendInvoice = async () => {
    if (!selectedEmail) {
      toast.error('Please select a recipient email')
      return
    }

    setIsSending(true)
    await sendInvoice({
      variables: {
        id: invoice.id,
        recipientEmail: selectedEmail,
      },
    })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Invoice {invoice.id}
        </h2>
      </header>

      {/* Email sending section - hidden on print */}
      {emailOptions.length > 0 && (
        <div className="mb-4 flex items-end gap-4 print:hidden">
          <div className="flex-1">
            <label htmlFor="recipient-email" className="rw-label">
              Send Invoice To
            </label>
            <select
              id="recipient-email"
              className="rw-input"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              <option value="">Select recipient...</option>
              {emailOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="rw-button rw-button-blue"
            disabled={!selectedEmail || isSending}
            onClick={handleSendInvoice}
          >
            {isSending ? 'Sending...' : 'Send Invoice'}
          </button>
        </div>
      )}

      <div className="rw-segment-main">
        <InvoiceForm invoice={invoice} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}

// ...existing code...
````

---

## Step 5: Verify Mailer Configuration

### 5.1 Ensure Mailer is Configured
Check that the mailer is properly configured in your API lib.

````typescript
// filepath: api/src/lib/mailer.ts
import { Mailer } from '@cedarjs/mailer'

export const mailer = new Mailer({
  transport: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  defaults: {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
})
````

---

## Step 6: Install Dependencies (if needed)

If `@react-email/components` is not already installed:

```bash
cd api
yarn add @react-email/components
```

---

## Step 7: Test the Implementation

### 7.1 Manual Testing Steps
1. Start dev server: `yarn cedar dev`
2. Navigate to an invoice edit page
3. Verify email dropdown appears with valid emails
4. Select a recipient and click "Send Invoice"
5. Verify:
   - Email is sent successfully
   - Invoice status updates to "SENT"
   - User is redirected to invoices list
   - Toast notification appears

### 7.2 Check Email
- Verify the email contains all required sections:
  - Installer details (from)
  - Client details (bill to)
  - Invoice metadata (dates, number)
  - Line items table with totals
  - Subtotal, tax, and total

---

## Step 8: Add Environment Variables

Ensure your `.env` file has the required SMTP settings:

```bash
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=invoices@yourcompany.com
```

---

## Summary

This implementation adds:
- ✅ Professional invoice email template with all required details
- ✅ Dropdown to select recipient (client or installer email)
- ✅ Send button that's disabled until email is selected
- ✅ Automatic status update to "SENT"
- ✅ Redirect to invoices list after successful send
- ✅ Toast notifications for success/error states
- ✅ Print-hidden UI elements
