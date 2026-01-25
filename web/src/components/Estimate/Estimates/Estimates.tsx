import { useState } from 'react'

import { Pencil, Trash2Icon } from 'lucide-react'
import type {
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables,
  FindEstimates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { EstimateDrawerContent } from 'src/components/Estimate/EstimateDrawerContent/EstimateDrawerContent'
import { QUERY } from 'src/components/Estimate/EstimatesCell'
import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'src/components/ui/drawer'
import { currencyDisplay, timeTagMDY, truncate } from 'src/lib/formatters.js'
import { sortByField, toggleSort } from 'src/lib/sort'
import { todayAsYYYYMMDD } from 'src/lib/utils'
import { generateCSV } from 'src/lib/csvExport'

const DELETE_ESTIMATE_MUTATION: TypedDocumentNode<
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables
> = gql`
  mutation DeleteEstimateMutation($id: Int!) {
    deleteEstimate(id: $id) {
      id
    }
  }
`

const EstimatesList = ({ estimates }: FindEstimates) => {
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })

  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
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

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((c) => toggleSort(c, key))
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const sortedEstimates = sortByField(
    estimates,
    sortConfig.key,
    sortConfig.direction
  )

  const handleExportEstimates = () => {
    // Transform estimates with billable items into flat rows
    const exportData: any[] = []

    estimates.forEach((estimate) => {
      if (!estimate.billableItems || estimate.billableItems.length === 0) {
        // Export estimate with empty line item if no billable items
        exportData.push({
          estimateId: estimate.id,
          estimateUuid: estimate.uuid,
          title: estimate.title,
          status: estimate.status,
          total: estimate.total,
          subtotal: estimate.subtotal,
          taxTotal: estimate.taxTotal,
          installerEntityId: estimate.installerEntityId,
          clientEntityId: estimate.clientEntityId,
          retailerEntityId: estimate.retailerEntityId,
          jobAddressLine1: estimate.jobAddressLine1,
          jobAddressLine2: estimate.jobAddressLine2,
          jobCity: estimate.jobCity,
          jobState: estimate.jobState,
          jobPostalCode: estimate.jobPostalCode,
          jobCountry: estimate.jobCountry,
          createdAt: estimate.createdAt,
          // Empty line item fields
          lineItemId: '',
          actionId: '',
          actionName: '',
          materialId: '',
          materialName: '',
          unitId: '',
          unitName: '',
          quantity: '',
          unitPrice: '',
          lineItemSubtotal: '',
        })
      } else {
        // Create one row per billable item
        estimate.billableItems.forEach((item) => {
          exportData.push({
            estimateId: estimate.id,
            estimateUuid: estimate.uuid,
            title: estimate.title,
            status: estimate.status,
            total: estimate.total,
            subtotal: estimate.subtotal,
            taxTotal: estimate.taxTotal,
            installerEntityId: estimate.installerEntityId,
            clientEntityId: estimate.clientEntityId,
            retailerEntityId: estimate.retailerEntityId,
            jobAddressLine1: estimate.jobAddressLine1,
            jobAddressLine2: estimate.jobAddressLine2,
            jobCity: estimate.jobCity,
            jobState: estimate.jobState,
            jobPostalCode: estimate.jobPostalCode,
            jobCountry: estimate.jobCountry,
            createdAt: estimate.createdAt,
            // Line item data
            lineItemId: item.id,
            actionId: item.actionId,
            actionName: item.action?.name || '',
            materialId: item.materialId,
            materialName: item.material?.name || '',
            unitId: item.unitId,
            unitName: item.unit?.fullName || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineItemSubtotal: item.subtotal,
          })
        })
      }
    })

    generateCSV(exportData, `${todayAsYYYYMMDD()}-estimates.csv`)
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSort('title')}
              className="table-cell text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Title
              <SortIcon columnKey="title" />
            </th>
            <th
              onClick={() => handleSort('total')}
              className="table-cell text-right cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Total
              <SortIcon columnKey="total" />
            </th>
            <th className="hidden sm:table-cell">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedEstimates.map((estimate) => (
            <tr key={estimate.id}>
              <td>
                <button
                  type="button"
                  title={'Details for estimate ' + estimate.id}
                  className="text-sm font-medium text-blue-600 hover:underline sm:hidden text-left"
                  onClick={() => setOpenDrawerId(estimate.id)}
                >
                  {truncate(estimate.title)}
                </button>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden sm:inline-flex"
                >
                  <Link
                    to={routes.estimate({ id: estimate.id })}
                    title={'Show estimate ' + estimate.id + ' detail'}
                  >
                    {truncate(estimate.title)}
                  </Link>
                </Button>
              </td>
              <td className="table-cell text-right">
                {currencyDisplay(estimate.total)}
              </td>
              <td className="hidden sm:table-cell">
                <nav className="rw-table-actions flex flex-wrap gap-1 sm:flex-nowrap">
                  <Link
                    to={routes.editEstimate({ id: estimate.id })}
                    title={'Edit estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-blue flex-1"
                  >
                    <Pencil />
                  </Link>
                  <button
                    type="button"
                    title={'Delete estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-red flex-1"
                    onClick={() => onDeleteClick(estimate.id)}
                  >
                    <Trash2Icon />
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Drawer for mobile details view */}
      {estimates.map((estimate) => (
        <Drawer
          key={`drawer-${estimate.id}`}
          open={openDrawerId === estimate.id}
          onOpenChange={(open) => setOpenDrawerId(open ? estimate.id : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Estimate Details</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <EstimateDrawerContent
                estimate={estimate}
                onDelete={onDeleteClick}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ))}

      <hr className="mb-6" />
      <Button
        className="print:hidden"
        variant="outline"
        size="sm"
        onClick={handleExportEstimates}
      >
        Export All Estimates
      </Button>
    </div>
  )
}

export default EstimatesList
