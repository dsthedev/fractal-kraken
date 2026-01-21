import { useRef } from 'react'

import type {
  DeleteBillableItemMutation,
  DeleteBillableItemMutationVariables,
  FindBillableItems,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import { QUERY } from 'src/components/BillableItem/BillableItemsCell'
import { ExportButton } from 'src/components/ExportButton/ExportButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'src/components/ui/alert-dialog'
import { Button } from 'src/components/ui/button'
import { calculateSubtotal } from 'src/lib/calculations'
import { parseCSV } from 'src/lib/csvParse'
import { currencyDisplay, formatEnum, truncate } from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  DeleteBillableItemMutation,
  DeleteBillableItemMutationVariables
> = gql`
  mutation DeleteBillableItemMutation($id: Int!) {
    deleteBillableItem(id: $id) {
      id
    }
  }
`

const BillableItemsList = ({ billableItems }: FindBillableItems) => {
  const { currentUser } = useAuth()
  const [deleteBillableItem] = useMutation(DELETE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => {
      toast.success('BillableItem deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const CREATE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<any, any> = gql`
    mutation CreateBillableItem($input: CreateBillableItemInput!) {
      createBillableItem(input: $input) {
        id
      }
    }
  `

  const [createBillableItem] = useMutation(CREATE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => {},
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteBillableItemMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete billableItem ' + id + '?')) {
      deleteBillableItem({ variables: { id } })
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows || rows.length < 2) {
        toast.error('CSV must have header and at least one data row')
        return
      }
      const headers = rows[0].map((h) => h.trim())
      let imported = 0
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
        if (!cols || cols.length === 0) continue
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => (row[h] = (cols[idx] || '').trim()))

        // Support both flat and nested headers from export
        const toInt = (v: string | undefined) =>
          v && v.length ? parseInt(v, 10) : undefined
        const toFloat = (v: string | undefined) =>
          v && v.length ? parseFloat(v) : undefined

        const serviceId =
          toInt(row.serviceId) ?? toInt(row['service.id']) ?? undefined
        const unitId = toInt(row.unitId) ?? toInt(row['unit.id']) ?? undefined
        const unitPrice =
          toFloat(row.unitPrice) ?? toFloat(row['unitPrice']) ?? undefined
        const quantity =
          toFloat(row.quantity) ?? toFloat(row['quantity']) ?? undefined
        const pricingType = (row.pricingType || row['pricingType'] || 'SUB') as
          | 'SUB'
          | 'RETAIL'
        const estimatedMinutesPerUnit = toInt(row.estimatedMinutesPerUnit)
        const notes = row.notes || undefined
        const sortOrder = toInt(row.sortOrder)
        const estimateId = toInt(row.estimateId)

        // Compute subtotal if not provided
        const subtotal =
          toFloat(row.subtotal) !== undefined
            ? Number(row.subtotal)
            : unitPrice !== undefined && quantity !== undefined
              ? unitPrice * quantity
              : undefined

        if (
          serviceId === undefined ||
          unitId === undefined ||
          unitPrice === undefined ||
          quantity === undefined ||
          subtotal === undefined
        ) {
          // Skip invalid rows but continue processing others
          continue
        }

        const authorId = String(currentUser?.id || '')
        if (!authorId) {
          toast.error('You must be logged in to import billable items')
          break
        }

        await createBillableItem({
          variables: {
            input: {
              serviceId,
              unitId,
              unitPrice,
              pricingType,
              quantity,
              subtotal,
              estimatedMinutesPerUnit: estimatedMinutesPerUnit ?? undefined,
              notes,
              sortOrder: sortOrder ?? i - 1,
              estimateId: estimateId ?? undefined,
              authorId,
            },
          },
        })
        imported++
      }
      toast.success(`Imported ${imported} billable items`)
    } catch (err: any) {
      console.error('Import error', err)
      toast.error(`Import failed: ${err?.message || err}`)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const deleteAll = async () => {
    try {
      const promises: Promise<any>[] = []
      for (const bi of billableItems) {
        promises.push(deleteBillableItem({ variables: { id: bi.id } }))
      }
      await Promise.all(promises)
      toast.success(`Deleted ${billableItems.length} billable items`)
    } catch (err: any) {
      console.error('Delete all error', err)
      toast.error(`Failed to delete all billable items: ${err?.message || err}`)
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Service</th>
            {/* <th>Unit</th> */}
            <th>Unit price</th>
            {/* <th>Pricing type</th> */}
            <th>Qty</th>
            <th>Subtotal</th>
            {/* <th>Estimated minutes per unit</th> */}
            {/* <th>Notes</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {billableItems.map((billableItem) => (
            <tr key={billableItem.id}>
              <td>
                {truncate(formatEnum(billableItem.service?.action))}{' '}
                {truncate(billableItem.service?.material)}{' '}
                {truncate(billableItem.service?.context)}
              </td>
              <td>
                {currencyDisplay(billableItem.unitPrice)}/
                {truncate(billableItem.unit?.shortName)}
              </td>
              {/* <td>{truncate(billableItem.unit?.shortName)}</td> */}
              {/* <td>{formatEnum(billableItem.pricingType)}</td> */}
              <td>{truncate(billableItem.quantity)}</td>
              <td>
                {currencyDisplay(
                  calculateSubtotal(
                    billableItem.unitPrice,
                    billableItem.quantity
                  )
                )}
              </td>
              {/* <td>{truncate(billableItem.estimatedMinutesPerUnit)}</td> */}
              {/* <td>{truncate(billableItem.notes)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.billableItem({ id: billableItem.id })}
                    title={'Show billableItem ' + billableItem.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editBillableItem({ id: billableItem.id })}
                    title={'Edit billableItem ' + billableItem.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete billableItem ' + billableItem.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(billableItem.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="mb-6" />
      <div className="flex space-x-4">
        <ExportButton
          label="Export All Billable Items"
          data={billableItems}
          filename={`${todayAsYYYYMMDD()}-billable-items.csv`}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
        <Button
          className="print:hidden"
          variant="outline"
          size="sm"
          onClick={handleImportClick}
        >
          Import Billable Items
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="print:hidden">
              Delete All Billable Items
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all actions. Make sure to export a copy first.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAll()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default BillableItemsList
