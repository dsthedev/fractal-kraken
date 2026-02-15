import React from 'react'

import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Text,
  Hr,
  Heading,
} from '@react-email/components'

interface InvoiceEmailProps {
  invoice: any
}

const formatDate = (date: Date | string | null) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '$0.00'
  return `$${Number(value).toFixed(2)}`
}

export function Invoice({
  invoice = {
    invoiceNumber: 'INV-2026-001',
    createdAt: new Date('2026-02-15'),
    subtotal: 1500.0,
    taxTotal: 120.0,
    total: 1620.0,
    notes: 'Payment is due within 30 days. Thank you for your business!',
    payeeEntity: {
      name: 'Acme Services Inc.',
      email: 'billing@acmeservices.com',
      phone: '(555) 123-4567',
    },
    payorEntity: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 987-6543',
    },
    billableItems: [
      {
        action: { name: 'Install' },
        material: { name: 'Drywall' },
        context: { name: 'Living Room' },
        quantity: 250,
        unit: { shortName: 'sqft', fullName: 'square feet' },
        unitPrice: 4.0,
        subtotal: 1000.0,
      },
      {
        action: { name: 'Paint' },
        material: { name: 'Interior Walls' },
        context: { name: 'Bedroom' },
        quantity: 150,
        unit: { shortName: 'sqft', fullName: 'square feet' },
        unitPrice: 3.0,
        subtotal: 450.0,
      },
      {
        action: { name: 'Replace' },
        material: { name: 'Light Fixture' },
        context: null,
        quantity: 5,
        unit: { shortName: 'ea', fullName: 'each' },
        unitPrice: 10.0,
        subtotal: 50.0,
      },
    ],
  },
}: InvoiceEmailProps = {}) {
  const payee = invoice.payeeEntity || {}
  const payor = invoice.payorEntity || {}

  const payeeLines = [payee.name, payee.email, payee.phone]
    .filter(Boolean)
    .map(String)

  const payorLines = [payor.name, payor.email, payor.phone]
    .filter(Boolean)
    .map(String)

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Invoice ${invoice.invoiceNumber}`}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[24px] rounded border border-solid border-gray-200 p-[20px]">
            <Heading className="mx-0 my-[8px] p-0 text-center text-[20px] font-semibold text-black">
              Invoice
            </Heading>

            <div className="mt-2 mb-4 text-center text-[12px] text-gray-600">
              <Text className="m-0">
                <strong>No:</strong> {invoice.invoiceNumber}
              </Text>
              <Text className="m-0">
                <strong>Date:</strong> {formatDate(invoice.createdAt)}
              </Text>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 text-[13px] leading-[20px] text-black">
                <div className="font-semibold mb-1">From</div>
                {payeeLines.length === 0 ? (
                  <Text className="m-0 text-gray-500">No payee</Text>
                ) : (
                  payeeLines.map((line, idx) => (
                    <Text key={idx} className="m-0">
                      {line}
                    </Text>
                  ))
                )}
              </div>

              <div className="rounded border border-gray-200 bg-gray-50 p-3 text-[13px] leading-[20px] text-black">
                <div className="font-semibold mb-1">Bill To</div>
                {payorLines.length === 0 ? (
                  <Text className="m-0 text-gray-500">No payor</Text>
                ) : (
                  payorLines.map((line, idx) => (
                    <Text key={idx} className="m-0">
                      {line}
                    </Text>
                  ))
                )}
              </div>
            </div>

            <Hr className="mx-0 my-[16px] w-full border border-solid border-[#eaeaea]" />

            <div className="mt-3">
              <div className="text-[13px] font-semibold mb-2">Items</div>
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2 pr-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.billableItems || []).length === 0 ? (
                    <tr>
                      <td className="py-3 text-gray-500" colSpan={4}>
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    (invoice.billableItems || []).map(
                      (item: any, idx: number) => {
                        const actionName = item.action?.name || ''
                        const materialName = item.material?.name || ''
                        const contextName =
                          item.context?.name || item.context || ''
                        const description = [
                          actionName,
                          materialName,
                          contextName,
                        ]
                          .filter(Boolean)
                          .join(' ')
                        const unitShortName =
                          item.unit?.shortName || item.unit?.fullName || ''

                        return (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 align-top"
                          >
                            <td className="py-2 pr-2">
                              {description || 'Item'}
                            </td>
                            <td className="py-2 pr-2">
                              {Number(item.quantity ?? 0)}
                            </td>
                            <td className="py-2 pr-2 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-2 text-right">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        )
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end text-[14px] text-black">
              <div className="text-right">
                <div className="text-[12px] uppercase tracking-wide text-gray-600">
                  Subtotal
                </div>
                <div className="text-[16px]">
                  {formatCurrency(invoice.subtotal)}
                </div>
                <div className="text-[12px] uppercase tracking-wide text-gray-600 mt-1">
                  Tax
                </div>
                <div className="text-[16px]">
                  {formatCurrency(invoice.taxTotal)}
                </div>
                <div className="text-[12px] uppercase tracking-wide text-gray-600 mt-2">
                  Total
                </div>
                <div className="text-[20px] font-semibold mt-1">
                  {formatCurrency(invoice.total)}
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />
                <Text className="text-[12px] leading-[20px] text-[#666666]">
                  {invoice.notes}
                </Text>
              </>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
