import { useTransition, useState } from 'react'

import { useMutation } from '@apollo/client'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from 'graphql-tag'

import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'

interface Entity {
  id: number
  name: string
  email?: string | null
}

interface SendInvoiceEmailMutation {
  sendInvoice: {
    uuid: string
    status: string
  }
}

interface SendInvoiceEmailMutationVariables {
  uuid: string
  recipientEmail: string
}

const SEND_INVOICE_EMAIL_MUTATION: TypedDocumentNode<
  SendInvoiceEmailMutation,
  SendInvoiceEmailMutationVariables
> = gql`
  mutation SendInvoiceEmail($uuid: String!, $recipientEmail: String!) {
    sendInvoice(uuid: $uuid, recipientEmail: $recipientEmail) {
      uuid
      status
    }
  }
`

interface SendInvoiceEmailProps {
  invoiceUuid: string
  entities: Entity[]
}

const SendInvoiceEmail = ({ invoiceUuid, entities }: SendInvoiceEmailProps) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [sendInvoiceEmail, { loading }] = useMutation(
    SEND_INVOICE_EMAIL_MUTATION,
    {
      onCompleted: () => {
        toast.success('Invoice sent via email')
        setSelectedEmail(null)
      },
      onError: (error) => {
        toast.error(`Failed to send invoice: ${error.message}`)
      },
    }
  )

  const emailOptions = entities
    .filter((entity) => entity.email)
    .map((entity) => ({
      email: entity.email!,
      label: `${entity.name} (${entity.email})`,
    }))

  const hasEmails = emailOptions.length > 0

  const handleSendClick = () => {
    if (!selectedEmail) return

    startTransition(() => {
      sendInvoiceEmail({
        variables: {
          uuid: invoiceUuid,
          recipientEmail: selectedEmail,
        },
      })
    })
  }

  return (
    <div className="flex items-center gap-4">
      <h3 className="text-sm font-semibold">Send Invoice via Email</h3>
      {hasEmails ? (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedEmail
                  ? emailOptions.find((o) => o.email === selectedEmail)?.label
                  : 'Select Email'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Recipient</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {emailOptions.map((option) => (
                <DropdownMenuItem
                  key={option.email}
                  onClick={() => setSelectedEmail(option.email)}
                  className={selectedEmail === option.email ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={handleSendClick}
            disabled={!selectedEmail || loading}
          >
            Send
          </Button>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No Emails Found</div>
      )}
    </div>
  )
}

export default SendInvoiceEmail
