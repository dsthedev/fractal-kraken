import React, { useRef } from 'react'

import type {
  ImportRatesMutation,
  ImportRatesMutationVariables,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'

const IMPORT_RATES_MUTATION: TypedDocumentNode<
  ImportRatesMutation,
  ImportRatesMutationVariables
> = gql`
  mutation ImportRatesMutation($data: [ImportRateInput!]!) {
    importRates(data: $data) {
      success
      message
      errors
      count
    }
  }
`

interface ImportButtonProps extends React.ComponentProps<typeof Button> {
  label?: string
  onSuccess?: () => void
  refetchQuery?: any
}

export const ImportButton = ({
  label = 'Import',
  onSuccess,
  refetchQuery,
  ...props
}: ImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importRates] = useMutation(IMPORT_RATES_MUTATION, {
    onCompleted: (data) => {
      const msg =
        data.importRates.message + ` (${data.importRates.count} rates imported)`
      if (data.importRates.errors && data.importRates.errors.length) {
        // show primary message and log detailed errors to console, and show toast with brief note
        toast.error(
          msg + ` — ${data.importRates.errors.length} errors (see console)`
        )
        console.groupCollapsed('Import errors')
        data.importRates.errors.forEach((e: string) => console.error(e))
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

        // Parse and validate required integer fields (support actionId/materialId and legacy serviceId)
        const serviceId = row.serviceId ? parseInt(row.serviceId) : NaN
        const actionId = row.actionId ? parseInt(row.actionId) : NaN
        const materialId = row.materialId ? parseInt(row.materialId) : NaN
        const unitId = row.unitId ? parseInt(row.unitId) : NaN

        // Only include rows with valid required fields: must have unitId, amounts, and at least one of actionId/materialId/serviceId
        const hasServiceKey =
          !isNaN(actionId) || !isNaN(materialId) || !isNaN(serviceId)
        if (
          hasServiceKey &&
          !isNaN(unitId) &&
          row.subAmount &&
          row.retailAmount
        ) {
          const rateData: any = {
            unitId,
            subAmount: row.subAmount,
            retailAmount: row.retailAmount,
            currency: row.currency || 'USD',
          }

          // Map parsed IDs into import payload
          if (!isNaN(actionId)) rateData.actionId = actionId
          if (!isNaN(materialId)) rateData.materialId = materialId

          // Only add optional fields if they have valid values
          if (
            row.estimatedMinutesPerUnit &&
            row.estimatedMinutesPerUnit !== ''
          ) {
            const eMpU = parseInt(row.estimatedMinutesPerUnit)
            if (!isNaN(eMpU)) {
              rateData.estimatedMinutesPerUnit = eMpU
            }
          }
          if (row.description && row.description !== '') {
            rateData.description = row.description
          }

          // Support unit name fields from export CSV so server can resolve units
          const unitFullName =
            row['unit.fullName'] || row['unit_fullName'] || row['unitFullName']
          const unitShortName =
            row['unit.shortName'] ||
            row['unit_shortName'] ||
            row['unitShortName']
          if (unitFullName && unitFullName !== '')
            rateData.unitFullName = unitFullName
          if (unitShortName && unitShortName !== '')
            rateData.unitShortName = unitShortName

          // Support action/material names from CSV (headers like "action.name" / "material.name")
          const actionName =
            row['action.name'] || row['action_name'] || row['action']
          const materialName =
            row['material.name'] || row['material_name'] || row['material']
          if (actionName && actionName !== '') {
            rateData.actionName = actionName
          }
          if (materialName && materialName !== '') {
            rateData.materialName = materialName
          }

          data.push(rateData)
        } else {
          skippedCount++
          console.log('Skipped row:', {
            actionId,
            materialId,
            serviceId,
            unitId,
            row,
          })
        }
      }

      if (data.length === 0) {
        toast.error(
          `No valid rates found in CSV file (${skippedCount} rows skipped)`
        )
        return
      }

      console.log(`Importing ${data.length} rates (${skippedCount} skipped)`)
      importRates({ variables: { data } })

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
