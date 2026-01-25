import { useRef } from 'react'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'

type ImportEstimatesMutation = {
  importEstimates: {
    success: boolean
    message: string
    errors: string[] | null
    count: number
  }
}

const IMPORT_ESTIMATES_MUTATION: TypedDocumentNode<
  ImportEstimatesMutation,
  { data: any[] }
> = gql`
  mutation ImportEstimatesMutation($data: [ImportEstimateInput!]!) {
    importEstimates(data: $data) {
      success
      message
      errors
      count
    }
  }
`

interface ImportEstimatesButtonProps
  extends React.ComponentProps<typeof Button> {
  label?: string
  onSuccess?: () => void
  refetchQuery?: any
}

export const ImportEstimatesButton = ({
  label = 'Import',
  onSuccess,
  refetchQuery,
  ...props
}: ImportEstimatesButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importEstimates] = useMutation(IMPORT_ESTIMATES_MUTATION, {
    onCompleted: (data) => {
      const msg =
        data.importEstimates.message +
        ` (${data.importEstimates.count} estimates imported)`
      if (data.importEstimates.errors && data.importEstimates.errors.length) {
        toast.error(
          msg + ` — ${data.importEstimates.errors.length} errors (see console)`
        )
        console.groupCollapsed('Import errors')
        data.importEstimates.errors.forEach((e: string) => console.error(e))
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
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        toast.error('CSV file must have a header and at least one data row')
        return
      }

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

      const headers = parseCSVLine(lines[0])
      const data: any[] = []
      let skippedCount = 0

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const row: Record<string, string> = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        const uuid = row.uuid
        const status = row.status
        const subtotal = parseFloat(row.subtotal)
        const taxTotal = parseFloat(row.taxTotal)
        const total = parseFloat(row.total)

        if (
          uuid &&
          status &&
          !isNaN(subtotal) &&
          !isNaN(taxTotal) &&
          !isNaN(total)
        ) {
          const estimateData: any = {
            uuid,
            status: status as any,
            subtotal,
            taxTotal,
            total,
          }

          if (row.title) estimateData.title = row.title
          if (row.installerEntityId) {
            const id = parseInt(row.installerEntityId)
            if (!isNaN(id)) estimateData.installerEntityId = id
          }
          if (row.clientEntityId) {
            const id = parseInt(row.clientEntityId)
            if (!isNaN(id)) estimateData.clientEntityId = id
          }
          if (row.retailerEntityId) {
            const id = parseInt(row.retailerEntityId)
            if (!isNaN(id)) estimateData.retailerEntityId = id
          }
          if (row.jobAddressLine1)
            estimateData.jobAddressLine1 = row.jobAddressLine1
          if (row.jobAddressLine2)
            estimateData.jobAddressLine2 = row.jobAddressLine2
          if (row.jobCity) estimateData.jobCity = row.jobCity
          if (row.jobState) estimateData.jobState = row.jobState
          if (row.jobPostalCode) estimateData.jobPostalCode = row.jobPostalCode
          if (row.jobCountry) estimateData.jobCountry = row.jobCountry
          if (row.estimatedMinutesTotal)
            estimateData.estimatedMinutesTotal = parseInt(
              row.estimatedMinutesTotal
            )
          if (row.notes) estimateData.notes = row.notes
          if (row.entityId) estimateData.entityId = parseInt(row.entityId)

          data.push(estimateData)
        } else {
          skippedCount++
          console.log('Skipped row (missing required fields):', row)
        }
      }

      if (data.length === 0) {
        toast.error(
          `No valid estimates found in CSV file (${skippedCount} rows skipped)`
        )
        return
      }

      console.log(
        `Importing ${data.length} estimates (${skippedCount} skipped)`
      )
      importEstimates({ variables: { data } })

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
