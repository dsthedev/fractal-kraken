import { useRef } from 'react'

import type {
  ImportEntitiesMutation,
  ImportEntitiesMutationVariables,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'

const IMPORT_ENTITIES_MUTATION: TypedDocumentNode<
  ImportEntitiesMutation,
  ImportEntitiesMutationVariables
> = gql`
  mutation ImportEntitiesMutation($data: [ImportEntityInput!]!) {
    importEntities(data: $data) {
      success
      message
      errors
      count
    }
  }
`

interface ImportEntitiesButtonProps
  extends React.ComponentProps<typeof Button> {
  label?: string
  onSuccess?: () => void
  refetchQuery?: any
}

export const ImportEntitiesButton = ({
  label = 'Import',
  onSuccess,
  refetchQuery,
  ...props
}: ImportEntitiesButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importEntities] = useMutation(IMPORT_ENTITIES_MUTATION, {
    onCompleted: (data) => {
      const msg =
        data.importEntities.message +
        ` (${data.importEntities.count} entities imported)`
      if (data.importEntities.errors && data.importEntities.errors.length) {
        toast.error(
          msg + ` — ${data.importEntities.errors.length} errors (see console)`
        )
        console.groupCollapsed('Import errors')
        data.importEntities.errors.forEach((e: string) => console.error(e))
        console.groupEnd()
      } else {
        toast.success(msg)
      }
      if (onSuccess) {
        onSuccess()
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
    ...(refetchQuery && {
      refetchQueries: [{ query: refetchQuery }],
      awaitRefetchQueries: true,
    }),
  })

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Parse CSV
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        toast.error('CSV file must have a header and at least one data row')
        return
      }

      // Helper to parse CSV line handling quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"'
              i++ // Skip next quote
            } else {
              // Toggle quote state
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

      const headers = parseCSVLine(lines[0])
      const data: any[] = []
      let skippedCount = 0

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const row: Record<string, string> = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        // Validate required fields for Entity
        const type = row.type
        const name = row.name

        if (type && name) {
          const entityData: any = {
            type: type as any, // EntityType enum
            name,
          }

          // Add optional fields if present
          if (row.nickname) entityData.nickname = row.nickname
          if (row.contactName) entityData.contactName = row.contactName
          if (row.email) entityData.email = row.email
          if (row.phone) entityData.phone = row.phone
          if (row.addressLine1) entityData.addressLine1 = row.addressLine1
          if (row.addressLine2) entityData.addressLine2 = row.addressLine2
          if (row.city) entityData.city = row.city
          if (row.state) entityData.state = row.state
          if (row.postalCode) entityData.postalCode = row.postalCode
          if (row.country) entityData.country = row.country
          if (row.notes) entityData.notes = row.notes

          data.push(entityData)
        } else {
          skippedCount++
          console.log('Skipped row (missing type or name):', row)
        }
      }

      if (data.length === 0) {
        toast.error(
          `No valid entities found in CSV file (${skippedCount} rows skipped)`
        )
        return
      }

      console.log(`Importing ${data.length} entities (${skippedCount} skipped)`)
      importEntities({ variables: { data } })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(`Failed to parse CSV: ${error.message}`)
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
