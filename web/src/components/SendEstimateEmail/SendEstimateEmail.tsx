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

interface SendEstimateEmailMutation {
  sendEstimateEmail: boolean
}

interface SendEstimateEmailMutationVariables {
  estimateId: number
  recipientEmail: string
}

const SEND_ESTIMATE_EMAIL_MUTATION: TypedDocumentNode<
  SendEstimateEmailMutation,
  SendEstimateEmailMutationVariables
> = gql`
  mutation SendEstimateEmail($estimateId: Int!, $recipientEmail: String!) {
    sendEstimateEmail(estimateId: $estimateId, recipientEmail: $recipientEmail)
  }
`

interface SendEstimateEmailProps {
  estimateId: number
  entities: Entity[]
}

const SendEstimateEmail = ({
  estimateId,
  entities,
}: SendEstimateEmailProps) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [sendEstimateEmail, { loading }] = useMutation(
    SEND_ESTIMATE_EMAIL_MUTATION,
    {
      onCompleted: () => {
        toast.success('Estimate sent via email')
        setSelectedEmail(null)
      },
      onError: (error) => {
        toast.error(`Failed to send estimate: ${error.message}`)
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
      sendEstimateEmail({
        variables: {
          estimateId,
          recipientEmail: selectedEmail,
        },
      })
    })
  }

  return (
    <div className="flex items-center gap-4">
      <h3 className="text-sm font-semibold">Send Estimate via Email</h3>
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

export default SendEstimateEmail
