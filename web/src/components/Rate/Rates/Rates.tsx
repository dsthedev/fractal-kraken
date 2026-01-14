import { useState } from 'react'

import { Pencil, Trash2, Filter } from 'lucide-react'
import type {
  DeleteRateMutation,
  DeleteRateMutationVariables,
  DeleteAllRatesMutation,
  FindRates,
  ServiceAction,
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
import { Checkbox } from 'src/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from 'src/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
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

// All service action types from the enum
const SERVICE_ACTIONS: ServiceAction[] = [
  'INSTALL',
  'REMOVE',
  'REPLACE',
  'RESET',
  'REPAIR',
  'FINISH',
  'PREPARE',
  'CLEAN',
  'MOVE',
  'INSPECT',
  'PERFORM',
  'CUSTOM',
]

const RatesList = ({ rates }: FindRates) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)
  const [selectedActions, setSelectedActions] = useState<Set<ServiceAction>>(
    new Set(SERVICE_ACTIONS)
  )

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

  const toggleAction = (action: ServiceAction) => {
    const newSelected = new Set(selectedActions)
    if (newSelected.has(action)) {
      newSelected.delete(action)
    } else {
      newSelected.add(action)
    }
    setSelectedActions(newSelected)
  }

  const selectAll = () => setSelectedActions(new Set(SERVICE_ACTIONS))
  const deselectAll = () => setSelectedActions(new Set())

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

  const filteredRates = rates.filter((rate) =>
    selectedActions.has(rate.service?.action)
  )

  const sortedRates = [...filteredRates].sort((a, b) => {
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
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm flex text-muted-foreground flex gap-1">
          <span className="hidden sm:block">Showing:</span>
          {filteredRates.length} of {rates.length}
          <span className="hidden sm:block">rates</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Action
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={selectAll}>
                Select All
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={deselectAll}>
                Deselect All
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {SERVICE_ACTIONS.map((action) => (
                <DropdownMenuItem
                  key={action}
                  onSelect={(e) => {
                    e.preventDefault()
                    toggleAction(action)
                  }}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedActions.has(action)}
                    onCheckedChange={() => toggleAction(action)}
                  />
                  <span>{formatEnum(action)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th
              onClick={() => handleSort('service.action')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Service
              <SortIcon columnKey="service.action" />
            </th>
            <th
              onClick={() => handleSort('unit.fullName')}
              className="hidden sm:table-cell cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Unit
              <SortIcon columnKey="unit.fullName" />
            </th>
            <th
              onClick={() => handleSort('subAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-center"
            >
              Rate
              <SortIcon columnKey="subAmount" />
            </th>
            {/* <th
              onClick={() => handleSort('retailAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Retail
              <SortIcon columnKey="retailAmount" />
            </th> */}
            {/* <th>Currency</th> */}
            {/* <th>Author id</th> */}
            {/* <th className="hidden sm:table-cell text-left">{'eMpU'}</th> */}
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th className="hidden sm:table-cell">&nbsp;</th>
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
                <span className="hidden sm:inline">
                  {fullServiceDisplay(
                    formatEnum(rate.service?.action),
                    rate.service?.material,
                    rate.service?.context
                  )}
                </span>
              </td>
              <td className="hidden sm:table-cell">
                {rate.unit?.shortName || 'N/A'}
              </td>
              {/* <td>{truncate(rate.serviceId)}</td>
              <td>{truncate(rate.unitId)}</td> */}
              <td className="flex flex-col sm:flex-row sm:gap-4 text-right sm:justify-center">
                <span className="text-muted-foreground">
                  {currencyDisplay(rate.subAmount)}
                </span>
                <strong>{currencyDisplay(rate.retailAmount)}</strong>
              </td>
              {/* <td>{truncate(rate.currency)}</td> */}
              {/* <td>{truncate(rate.authorId)}</td> */}
              {/* <td className="hidden sm:table-cell text-left">
                {truncate(rate.estimatedMinutesPerUnit)}
              </td>
              {/* <td>{truncate(rate.description)}</td> */}
              {/* <td>{timeTag(rate.createdAt)}</td> */}
              {/* <td>{timeTag(rate.updatedAt)}</td> */}
              <td className="print:hidden hidden sm:table-cell">
                <nav className="rw-table-actions flex gap-2 justify-end">
                  <Link
                    to={routes.editRate({ id: rate.id })}
                    title={'Edit rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="text-white pl-4">Edit</span>
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

      {/* Drawer for mobile details view - single instance */}
      {openDrawerId && sortedRates.find((rate) => rate.id === openDrawerId) && (
        <Drawer
          open={!!openDrawerId}
          onOpenChange={(open) => setOpenDrawerId(open ? openDrawerId : null)}
        >
          <DrawerContent>
            {(() => {
              const rate = sortedRates.find((r) => r.id === openDrawerId)
              if (!rate) return null

              return (
                <>
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
                      <p className="text-xs text-muted-foreground">
                        Measurement Unit
                      </p>
                      <p className="text-sm font-medium">
                        {rate.unit?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div className="flex py-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          Sub Rate
                        </p>
                        <p className="text-sm font-medium">
                          {currencyDisplay(rate.subAmount)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          Retail Rate
                        </p>
                        <p className="text-sm font-medium">
                          {currencyDisplay(rate.retailAmount)}
                        </p>
                      </div>
                    </div>
                    {rate.estimatedMinutesPerUnit && (
                      <div>
                        <p className="text-xs text-muted-foreground">eMpU</p>
                        <p className="text-sm font-medium">
                          {truncate(rate.estimatedMinutesPerUnit)}
                        </p>
                      </div>
                    )}
                    <nav className="flex flex-row gap-2 mt-4">
                      <Link
                        to={routes.editRate({ id: rate.id })}
                        title={'Edit rate ' + rate.id}
                        className="rw-button rw-button-blue flex-1"
                      >
                        <Pencil className="h-4 w-4" />{' '}
                        <span className="px-4">Edit Rate</span>
                      </Link>
                      <button
                        type="button"
                        title={'Delete rate ' + rate.id}
                        className="rw-button rw-button-red flex"
                        onClick={() => onDeleteClick(rate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </>
              )
            })()}
          </DrawerContent>
        </Drawer>
      )}

      <hr className="mb-6" />
      <div className="flex flex-col md:flex-row gap-2">
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
