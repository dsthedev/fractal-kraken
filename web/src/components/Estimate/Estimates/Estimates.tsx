import { useMemo, useState } from 'react'

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
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'src/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { generateCSV } from 'src/lib/csvExport'
import { currencyDisplay, formatEnum, truncate } from 'src/lib/formatters.js'
import { sortByField, toggleSort } from 'src/lib/sort'
import { selectedEstimatesTotal, todayAsYYYYMMDD } from 'src/lib/utils'

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

const ESTIMATE_STATUSES = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'UNDERWAY',
  'INVOICED',
  'REJECTED',
  'EXPIRED',
] as const

interface EstimatesTableProps {
  estimates: FindEstimates['estimates']
  sortConfig: { key: string; direction: 'asc' | 'desc' }
  onSortChange: (config: { key: string; direction: 'asc' | 'desc' }) => void
  onDeleteClick: (id: number) => void
  setOpenDrawerId: (id: number | null) => void
  openDrawerId: number | null
}

const EstimatesTable = ({
  estimates,
  sortConfig,
  onSortChange,
  onDeleteClick,
  setOpenDrawerId,
}: EstimatesTableProps) => {
  const handleSort = (key: string) => {
    onSortChange(toggleSort(sortConfig, key))
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

  const getStatusBadgeVariant = (
    status: string
  ):
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'underway'
    | 'invoiced'
    | 'rejected'
    | 'expired' => {
    const statusMap: Record<
      string,
      | 'draft'
      | 'sent'
      | 'accepted'
      | 'underway'
      | 'invoiced'
      | 'rejected'
      | 'expired'
    > = {
      DRAFT: 'draft',
      SENT: 'sent',
      ACCEPTED: 'accepted',
      UNDERWAY: 'underway',
      INVOICED: 'invoiced',
      REJECTED: 'rejected',
      EXPIRED: 'expired',
    }
    return statusMap[status] || 'draft'
  }

  return (
    <table className="rw-table">
      <thead>
        <tr>
          <th className="table-cell text-left">Status</th>
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
            <td className="table-cell">
              <Badge variant={getStatusBadgeVariant(estimate.status)}>
                {formatEnum(estimate.status)}
              </Badge>
            </td>
            <td>
              <button
                type="button"
                title={'Details for estimate ' + estimate.id}
                className="text-sm font-medium text-blue-600 hover:underline sm:hidden text-left"
                onClick={() => setOpenDrawerId(estimate.id)}
              >
                {truncate(estimate.title)}
              </button>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
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
  )
}

const EstimatesList = ({ estimates }: FindEstimates) => {
  // Default: all statuses except INVOICED, REJECTED, and EXPIRED
  const getDefaultStatuses = (): string[] => {
    return ESTIMATE_STATUSES.filter(
      (status) => !['INVOICED', 'REJECTED', 'EXPIRED'].includes(status)
    )
  }

  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)
  const [selectedStatuses, setSelectedStatuses] =
    useState<string[]>(getDefaultStatuses())
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  }>({ key: 'title', direction: 'desc' })

  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

  // Count estimates by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ESTIMATE_STATUSES.forEach((status) => {
      counts[status] = estimates.filter((e) => e.status === status).length
    })
    return counts
  }, [estimates])

  // Filter estimates by selected statuses
  const filteredEstimates = useMemo(
    () =>
      selectedStatuses.length === 0
        ? estimates
        : estimates.filter((e) => selectedStatuses.includes(e.status)),
    [estimates, selectedStatuses]
  )

  const handleExportEstimates = () => {
    // Transform estimates with billable items into flat rows
    const exportData: any[] = []

    filteredEstimates.forEach((estimate) => {
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
    <div className="rw-segment">
      {/* Status filter dropdown */}
      <div className="flex items-center justify-between mb-4 space-y-2 sm:space-y-0 sm:flex-row flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-64">
              Filter Statuses ({selectedStatuses.length} selected)
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.length === ESTIMATE_STATUSES.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedStatuses([...ESTIMATE_STATUSES])
                } else {
                  setSelectedStatuses([])
                }
              }}
            >
              All Statuses ({estimates.length})
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {ESTIMATE_STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={(checked) => {
                  setSelectedStatuses((prev) => {
                    if (checked) {
                      return [...prev, status]
                    }
                    return prev.filter((s) => s !== status)
                  })
                }}
              >
                {formatEnum(status)} ({statusCounts[status]})
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex space-x-4">
          <Badge variant="outline">
            <strong>{selectedStatuses.length}</strong> <small>Status(es)</small>
          </Badge>
          <div className="text-2xl font-semibold">
            {currencyDisplay(selectedEstimatesTotal(filteredEstimates))}
          </div>
        </div>
        <div>&nbsp;</div>
      </div>

      {/* Table for filtered estimates */}
      {filteredEstimates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl">No Estimates Found for Selected Filters</p>
        </div>
      ) : (
        <div className="rw-table-wrapper-responsive">
          <EstimatesTable
            estimates={filteredEstimates}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            onDeleteClick={onDeleteClick}
            setOpenDrawerId={setOpenDrawerId}
            openDrawerId={openDrawerId}
          />
        </div>
      )}

      {/* Drawer for mobile details view */}
      {filteredEstimates.map((estimate) => (
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
        disabled={filteredEstimates.length === 0}
        size="sm"
        onClick={handleExportEstimates}
      >
        Export Filtered Estimates ({filteredEstimates.length})
      </Button>
    </div>
  )
}

export default EstimatesList
