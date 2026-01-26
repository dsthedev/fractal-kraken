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
// filter UI removed - no Checkbox needed
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'src/components/ui/drawer'
// filter UI removed - dropdown menu components removed
import {
  truncate,
  currencyDisplay,
  fullServiceDisplay,
} from 'src/lib/formatters.js'
import { buildRateSentence } from 'src/lib/rateSentence'
import { sortByField, toggleSort } from 'src/lib/sort'
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
  | 'unit.fullName'
  | 'action.name'
  | 'material.name'
  | 'retailAmount'

const RatesList = ({ rates }: FindRates) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)
  const [showRetail, setShowRetail] = useState<boolean>(true)

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
    setSortConfig((c) => toggleSort(c, key as string))
  }

  // No filter UI: show all rates

  const filteredRates = rates

  const sortedRates = sortByField(
    filteredRates,
    sortConfig.key,
    sortConfig.direction
  )

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
      </div>

      <div className="flex justify-end mb-2">
        <span className="text-muted-foreground print:hidden">
          Show rates for:{' '}
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => setShowRetail((s) => !s)}
            title="Toggle shown rate"
          >
            {showRetail ? 'Sub' : 'Retail'}
          </Button>
        </span>
      </div>

      <table className="rw-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSort('action.name')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Action
              <SortIcon columnKey="action.name" />
            </th>
            <th
              onClick={() => handleSort('material.name')}
              className="hidden sm:table-cell cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Material
              <SortIcon columnKey="material.name" />
            </th>
            <th
              onClick={() =>
                handleSort(showRetail ? 'retailAmount' : 'subAmount')
              }
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-right"
            >
              {showRetail ? 'Retail Rate' : 'Sub Rate'}
              <SortIcon columnKey={showRetail ? 'retailAmount' : 'subAmount'} />
            </th>
            <th>&nbsp;</th>
            <th
              onClick={() => handleSort('unit.fullName')}
              className="hidden sm:table-cell cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              Unit
              <SortIcon columnKey="unit.fullName" />
            </th>
            <th className="hidden sm:table-cell">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedRates.map((rate) => (
            <tr key={rate.id}>
              <td className="text-lg font-semibold">
                <button
                  type="button"
                  title={
                    'Show ' +
                    fullServiceDisplay(
                      rate.action?.name,
                      rate.material?.name,
                      rate?.context
                    )
                  }
                  className="text-left text-lg font-medium text-blue-600 hover:underline sm:hidden"
                  onClick={() => setOpenDrawerId(rate.id)}
                >
                  {fullServiceDisplay(
                    rate.action?.name,
                    rate.material?.name,
                    ''
                  )}{' '}
                  <span className="text-sm print:text-xs text-muted-foreground">
                    {rate?.context}
                  </span>
                </button>
                <span className="hidden sm:inline">{rate.action?.name}</span>
              </td>
              <td className="hidden sm:table-cell text-xl print:text-lg">
                {rate.material?.name || '...'}{' '}
                <span className="text-sm print:text-xs text-muted-foreground">
                  {rate?.context}
                </span>
              </td>
              <td className="flex justify-end text-right text-xl print:text-lg">
                {showRetail ? (
                  <strong>{currencyDisplay(rate.retailAmount)}</strong>
                ) : (
                  <strong className="text-muted-foreground">
                    {currencyDisplay(rate.subAmount)}
                  </strong>
                )}
              </td>
              <td className="text-muted-foreground">/</td>
              <td className="table-cell text-xs text-muted-foreground">
                {rate.unit?.shortName || '...'}
              </td>
              <td className="print:hidden hidden sm:table-cell">
                <nav className="rw-table-actions flex gap-2 justify-end">
                  <Link
                    to={routes.editRate({ id: rate.id })}
                    title={'Edit rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="pl-4">Edit</span>
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
                    <DrawerTitle className="text-xl font-semibold border-b-1 pb-4 my-4">
                      {fullServiceDisplay(
                        rate.action?.name,
                        rate.material?.name,
                        ''
                      )}{' '}
                    </DrawerTitle>
                    <span className="text-sm text-muted-foreground border-b-1 pb-4">
                      {buildRateSentence(
                        rate.action?.name,
                        rate.material?.name,
                        rate.context,
                        rate.subAmount,
                        rate.retailAmount,
                        rate.unit?.shortName || rate.unit?.fullName,
                        rate.currency
                      )}
                    </span>
                  </DrawerHeader>
                  <div className="px-4 pb-6">
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Unit</p>
                        <p className="text-sm font-medium">
                          {rate.unit?.shortName || '...'}
                        </p>
                      </div>
                      {rate.estimatedMinutesPerUnit && (
                        <div>
                          <p className="text-xs text-muted-foreground">eMpU</p>
                          <p className="text-sm font-medium">
                            {truncate(rate.estimatedMinutesPerUnit)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Sub Rate
                        </p>
                        <p className="text-sm font-medium">
                          {currencyDisplay(rate.subAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Retail Rate
                        </p>
                        <p className="text-sm font-medium">
                          {currencyDisplay(rate.retailAmount)}
                        </p>
                      </div>
                    </div>

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
