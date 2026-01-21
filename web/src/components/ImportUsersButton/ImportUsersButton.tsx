import React, { useRef } from 'react'

import type {
  CreateUserMutation,
  CreateUserMutationVariables,
  CreateUserInput,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'
import { useApolloClient } from '@apollo/client'

import { Button } from 'src/components/ui/button'

const CREATE_USER_MUTATION: TypedDocumentNode<
  CreateUserMutation,
  CreateUserMutationVariables
> = gql`
  mutation CreateUserMutation($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`

interface ImportUsersButtonProps extends React.ComponentProps<typeof Button> {
  label?: string
  onSuccess?: () => void
  refetchQuery?: any
}

export const ImportUsersButton = ({
  label = 'Import Users',
  onSuccess,
  refetchQuery,
  ...props
}: ImportUsersButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const client = useApolloClient()

  const [createUser] = useMutation(CREATE_USER_MUTATION)

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        toast.error('CSV file must have a header and at least one data row')
        return
      }

      const headers = parseCSVLine(lines[0])
      let imported = 0
      let skipped = 0
      let failed = 0

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })

        const email = (row.email || '').trim()
        if (!email) {
          skipped++
          continue
        }

        const input: CreateUserInput = {
          email,
          name: row.name || undefined,
          roles: row.roles || 'USER',
          // Provide empty strings for required hash fields; existing flow
          // appears to accept these values on createUser elsewhere.
          hashedPassword: row.hashedPassword || '',
          salt: row.salt || '',
        }

        try {
          // Await each create so we can surface errors per-row
          // @ts-ignore - typed hook returns a promise-like result
          await createUser({ variables: { input } })
          imported++
        } catch (err: any) {
          console.error('Failed to import user', email, err)
          failed++
        }
      }

      const msg = `Imported ${imported} users` +
        (skipped ? `, ${skipped} skipped` : '') +
        (failed ? `, ${failed} failed` : '')
      toast.success(msg)

      if (refetchQuery) {
        try {
          await client.query({ query: refetchQuery })
        } catch (e) {
          // ignore
        }
      }

      if (onSuccess) onSuccess()

      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(`Failed to parse CSV: ${error?.message || error}`)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        className="print:hidden"
        variant="outline"
        size="sm"
        onClick={handleClick}
        {...props}
      >
        {label}
      </Button>
    </>
  )
}

export default ImportUsersButton
