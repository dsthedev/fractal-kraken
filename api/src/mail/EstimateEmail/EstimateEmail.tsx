import React from 'react'

import {
  Html,
  Text,
  Hr,
  Body,
  Head,
  Tailwind,
  Preview,
  Container,
  Heading,
  Link,
} from '@react-email/components'

interface EstimateEmailProps {
  estimateTitle: string
  clientName: string
  estimateLink: string
  contractorName: string
  installer?: {
    name?: string | null
    contactName?: string | null
    email?: string | null
    phone?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  }
  billableItems: Array<{
    quantity: number
    unitShortName?: string | null
    description: string
    unitPrice?: number | null
    subtotal?: number | null
  }>
  total: number
}

export function EstimateEmail({
  estimateTitle,
  clientName,
  estimateLink,
  contractorName,
  installer,
  billableItems,
  total,
}: EstimateEmailProps) {
  const formatCurrency = (value?: number | null) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00'

  const installerLines = [
    // installer?.name,
    installer?.contactName,
    installer?.email,
    installer?.phone,
    // [installer?.addressLine1, installer?.addressLine2]
    //   .filter(Boolean)
    //   .join(', '),
    // [installer?.city, installer?.state].filter(Boolean).join(', '),
    // installer?.postalCode,
    // installer?.country,
  ].filter(Boolean)

  return (
    <Html lang="en">
      <Head />
      <Preview>{`${estimateTitle}`}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[32px] rounded border border-solid border-gray-200 p-[20px]">
            <Heading className="mx-0 my-[12px] p-0 text-center text-[20px] font-semibold text-black">
              Estimate
            </Heading>
            <Text className="m-0 mb-[12px] text-center text-[12px] text-gray-600">
              {contractorName} - Estimate: {estimateTitle}
            </Text>

            <div className="text-[14px] leading-[22px] text-black space-y-3">
              <Text>Hi {clientName},</Text>
              <Text>
                This estimate is based on the items we discussed. Please review
                the details below and reach out if you have any questions.
              </Text>
            </div>

            {installerLines.length > 0 && (
              <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-3 text-[13px] leading-[20px] text-black">
                <div className="font-semibold mb-1">Installer</div>
                {installerLines.map((line, idx) => (
                  <Text key={idx} className="m-0">
                    {line}
                  </Text>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="text-[13px] font-semibold mb-2">Items</div>
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2 pr-2">U/M</th>
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {billableItems.length === 0 ? (
                    <tr>
                      <td className="py-3 text-gray-500" colSpan={5}>
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    billableItems.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 align-top"
                      >
                        <td className="py-2 pr-2">{item.quantity}</td>
                        <td className="py-2 pr-2">
                          {item.unitShortName || '-'}
                        </td>
                        <td className="py-2 pr-2">{item.description}</td>
                        <td className="py-2 pr-2 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end text-[14px] text-black">
              <div className="text-right">
                <div className="text-[12px] uppercase tracking-wide text-gray-600">
                  Estimate Total
                </div>
                <div className="text-[20px] font-semibold">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[20px] text-[#666666]">
              This estimate is not final and may change if additional work or
              materials are required. Please contact us with any questions.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
