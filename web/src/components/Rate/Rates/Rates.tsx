import { useState } from 'react'

import { Pencil, Trash2 } from 'lucide-react'
import type {
  DeleteRateMutation,
  DeleteRateMutationVariables,
  DeleteAllRatesMutation,
  FindRates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { ImportButton } from 'src/components/ImportButton/ImportButton'
import { QUERY } from 'src/components/Rate/RatesCell'
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from 'src/components/ui/drawer'
import {
  truncate,
  currencyDisplay,
  formatEnum,
  fullServiceDisplay,
} from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_RATE_MUTATION: TypedDocumentNode<
  DeleteRateMutation,
  DeleteRateMutationVariables
> = gql`
  mutation DeleteRateMutation($id: Int!) {
    deleteRate(id: $id) {
      id
    }
  }
`

const DELETE_ALL_RATES_MUTATION: TypedDocumentNode<
  DeleteAllRatesMutation,
  Record<string, never>
> = gql`
  mutation DeleteAllRatesMutation {
    deleteAllRates {
      success
      message
      count
    }
  }
`

// Define a custom type for sortable fields including nested paths
type SortableField =
  | keyof FindRates['rates'][0]
  | 'service.action'
  | 'unit.fullName'

const RatesList = ({ rates }: FindRates) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)

  const [deleteRate] = useMutation(DELETE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate deleted')
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

  const [deleteAllRates] = useMutation(DELETE_ALL_RATES_MUTATION, {
    onCompleted: (data) => {
      toast.success(
        data.deleteAllRates.message +
          ` (${data.deleteAllRates.count} rates deleted)`
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const handleSort = (key: SortableField) => {
    if (sortConfig.key === key) {
      // Cycle through: asc -> desc -> remove (back to default)
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' })
      } else {
        // Reset to default
        setSortConfig({ key: 'id', direction: 'asc' })
      }
    } else {
      // New column clicked, start with asc
      setSortConfig({ key, direction: 'asc' })
    }
  }

  // Helper function to get nested property value
  const getNestedValue = (obj: FindRates['rates'][0], path: SortableField) => {
    if (path === 'service.action') {
      return obj.service?.action
    }
    if (path === 'unit.fullName') {
      return obj.unit?.fullName
    }
    return obj[path as keyof FindRates['rates'][0]]
  }

  const sortedRates = [...rates].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.key)
    const bValue = getNestedValue(b, sortConfig.key)

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Handle string comparison (case-insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue
        .toLowerCase()
        .localeCompare(bValue.toLowerCase())
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const onDeleteClick = (id: DeleteRateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete rate ' + id + '?')) {
      deleteRate({ variables: { id } })
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortableField }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th
              onClick={() => handleSort('service.action')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Service
              <SortIcon columnKey="service.action" />
            </th>
            <th
              onClick={() => handleSort('unit.fullName')}
              className="hidden sm:table-cell cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Unit
              <SortIcon columnKey="unit.fullName" />
            </th>
            <th
              onClick={() => handleSort('subAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sub $
              <SortIcon columnKey="subAmount" />
            </th>
            <th
              onClick={() => handleSort('retailAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Retail $
              <SortIcon columnKey="retailAmount" />
            </th>
            {/* <th>Currency</th> */}
            {/* <th>Author id</th> */}
            <th className="hidden sm:table-cell">{'eMpU'}</th>
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedRates.map((rate) => (
            <tr key={rate.id}>
              {/* <td>{truncate(rate.id)}</td> */}
              <td>
                <button
                  type="button"
                  title={
                    'Show ' +
                    fullServiceDisplay(
                      formatEnum(rate.service?.action),
                      rate.service?.material,
                      rate.service?.context
                    ) +
                    ' details'
                  }
                  className="text-left text-sm font-medium text-blue-600 hover:underline sm:hidden"
                  onClick={() => setOpenDrawerId(rate.id)}
                >
                  {fullServiceDisplay(
                    formatEnum(rate.service?.action),
                    rate.service?.material,
                    rate.service?.context
                  )}
                </button>
                <Link
                  to={routes.rate({ id: rate.id })}
                  title={
                    'Show ' +
                    fullServiceDisplay(
                      formatEnum(rate.service?.action),
                      rate.service?.material,
                      rate.service?.context
                    ) +
                    ' details'
                  }
                  className="hidden sm:inline"
                >
                  {fullServiceDisplay(
                    formatEnum(rate.service?.action),
                    rate.service?.material,
                    rate.service?.context
                  )}
                </Link>
              </td>
              <td className="hidden sm:table-cell">
                {rate.unit?.shortName || 'N/A'}
              </td>
              {/* <td>{truncate(rate.serviceId)}</td>
              <td>{truncate(rate.unitId)}</td> */}
              <td>{currencyDisplay(rate.subAmount)}</td>
              <td>{currencyDisplay(rate.retailAmount)}</td>
              {/* <td>{truncate(rate.currency)}</td> */}
              {/* <td>{truncate(rate.authorId)}</td> */}
              <td className="hidden sm:table-cell">
                {truncate(rate.estimatedMinutesPerUnit)}
              </td>
              {/* <td>{truncate(rate.description)}</td> */}
              {/* <td>{timeTag(rate.createdAt)}</td> */}
              {/* <td>{timeTag(rate.updatedAt)}</td> */}
              <td className="print:hidden">
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editRate({ id: rate.id })}
                    title={'Edit rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    title={'Delete rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(rate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Drawer for mobile details view */}
      {sortedRates.map((rate) => (
        <Drawer
          key={`drawer-${rate.id}`}
          open={openDrawerId === rate.id}
          onOpenChange={(open) => setOpenDrawerId(open ? rate.id : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {fullServiceDisplay(
                  formatEnum(rate.service?.action),
                  rate.service?.material,
                  rate.service?.context
                )}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="text-sm font-medium">
                  {rate.unit?.fullName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sub $</p>
                <p className="text-sm font-medium">
                  {currencyDisplay(rate.subAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retail $</p>
                <p className="text-sm font-medium">
                  {currencyDisplay(rate.retailAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">eMpU</p>
                <p className="text-sm font-medium">
                  {truncate(rate.estimatedMinutesPerUnit)}
                </p>
              </div>
            </div>
            <DrawerClose />
          </DrawerContent>
        </Drawer>
      ))}

      <hr className="mb-6" />
      <div className="flex gap-2">
        <ExportButton
          label="Export All Rates"
          data={sortedRates}
          filename={`${todayAsYYYYMMDD()}-rates.csv`}
        />
        <ImportButton label="Import Rates" refetchQuery={QUERY} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="print:hidden">
              Delete All Rates
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all your rates. Make sure to export a copy
                first. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAllRates()}
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

export default RatesList
