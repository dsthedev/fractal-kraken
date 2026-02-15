import { useMemo, useState } from 'react'

import { Pencil, Trash2Icon } from 'lucide-react'
import type {
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables,
  FindInvoices,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Invoice/InvoicesCell'
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
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_INVOICE_MUTATION: TypedDocumentNode<
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables
> = gql`
  mutation DeleteInvoiceMutation($uuid: String!) {
    deleteInvoice(uuid: $uuid) {
      uuid
    }
  }
`

const INVOICE_STATUSES = ['DRAFT', 'SENT', 'ARCHIVED'] as const
const INVOICE_PAY_STATUSES = ['UNPAID', 'OUTSTANDING', 'PAID'] as const

interface InvoicesTableProps {
  invoices: FindInvoices['invoices']
  sortConfig: { key: string; direction: 'asc' | 'desc' }
  onSortChange: (config: { key: string; direction: 'asc' | 'desc' }) => void
  onDeleteClick: (uuid: string) => void
  setOpenDrawerUuid: (uuid: string | null) => void
  openDrawerUuid: string | null
}

const InvoicesTable = ({
  invoices,
  sortConfig,
  onSortChange,
  onDeleteClick,
  setOpenDrawerUuid,
}: InvoicesTableProps) => {
  const handleSort = (key: string) => {
    onSortChange(toggleSort(sortConfig, key))
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const sortedInvoices = sortByField(
    invoices,
    sortConfig.key,
    sortConfig.direction
  )

  const getStatusBadgeVariant = (
    status: string
  ): 'draft' | 'sent' | 'archived' => {
    const statusMap: Record<string, 'draft' | 'sent' | 'archived'> = {
      DRAFT: 'draft',
      SENT: 'sent',
      ARCHIVED: 'archived',
    }
    return statusMap[status] || 'draft'
  }

  const getPayStatusBadgeVariant = (
    payStatus: string
  ): 'unpaid' | 'outstanding' | 'paid' => {
    const payStatusMap: Record<string, 'unpaid' | 'outstanding' | 'paid'> = {
      UNPAID: 'unpaid',
      OUTSTANDING: 'outstanding',
      PAID: 'paid',
    }
    return payStatusMap[payStatus] || 'unpaid'
  }

  return (
    <table className="rw-table">
      <thead>
        <tr>
          <th className="table-cell text-left">Status</th>
          <th className="text-left hidden md:table-cell">Pay Status</th>
          <th
            onClick={() => handleSort('invoiceNumber')}
            className="table-cell text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Invoice #
            <SortIcon columnKey="invoiceNumber" />
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
        {sortedInvoices.map((invoice) => (
          <tr key={invoice.uuid}>
            <td className="table-cell">
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {formatEnum(invoice.status)}
              </Badge>
            </td>
            <td className="hidden sm:table-cell">
              {invoice.status !== 'DRAFT' && (
                <Badge variant={getPayStatusBadgeVariant(invoice.payStatus)}>
                  {formatEnum(invoice.payStatus)}
                </Badge>
              )}
            </td>
            <td>
              <button
                type="button"
                title={'Details for invoice ' + invoice.invoiceNumber}
                className="text-sm font-medium text-blue-600 hover:underline sm:hidden text-left"
                onClick={() => setOpenDrawerUuid(invoice.uuid)}
              >
                {truncate(invoice.invoiceNumber)}
              </button>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link
                  to={routes.invoice({ uuid: invoice.uuid })}
                  title={'Show invoice ' + invoice.invoiceNumber + ' detail'}
                >
                  {truncate(invoice.invoiceNumber)}
                </Link>
              </Button>
            </td>
            <td className="table-cell text-right">
              {currencyDisplay(invoice.total)}
            </td>
            <td className="hidden sm:table-cell">
              <nav className="rw-table-actions flex flex-wrap gap-1 sm:flex-nowrap">
                <Link
                  to={routes.editInvoice({ uuid: invoice.uuid })}
                  title={'Edit invoice ' + invoice.invoiceNumber}
                  className="rw-button rw-button-small rw-button-blue flex-1"
                >
                  <Pencil />
                </Link>
                <button
                  type="button"
                  title={'Delete invoice ' + invoice.invoiceNumber}
                  className="rw-button rw-button-small rw-button-red flex-1"
                  onClick={() => onDeleteClick(invoice.uuid)}
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

const InvoiceDrawerContent = ({
  invoice,
  onDelete,
}: {
  invoice: FindInvoices['invoices'][0]
  onDelete: (uuid: string) => void
}) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <strong>Invoice #:</strong> {invoice.invoiceNumber}
      </div>
      <div>
        <strong>Status:</strong>{' '}
        <Badge variant={invoice.status.toLowerCase() as any}>
          {formatEnum(invoice.status)}
        </Badge>
      </div>
      <div>
        <strong>Pay Status:</strong>{' '}
        <Badge variant={invoice.payStatus.toLowerCase() as any}>
          {formatEnum(invoice.payStatus)}
        </Badge>
      </div>
      <div>
        <strong>Total:</strong> {currencyDisplay(invoice.total)}
      </div>
      {invoice.notes && (
        <div>
          <strong>Notes:</strong> {invoice.notes}
        </div>
      )}
      <div className="flex gap-2 pt-4">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link to={routes.invoice({ uuid: invoice.uuid })}>View</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={routes.editInvoice({ uuid: invoice.uuid })}>Edit</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(invoice.uuid)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

const InvoicesList = ({ invoices }: FindInvoices) => {
  // Default: all statuses except ARCHIVED, all pay statuses
  const getDefaultStatuses = (): string[] => {
    return INVOICE_STATUSES.filter((status) => status !== 'ARCHIVED')
  }

  const [openDrawerUuid, setOpenDrawerUuid] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] =
    useState<string[]>(getDefaultStatuses())
  const [selectedPayStatuses, setSelectedPayStatuses] = useState<string[]>([
    ...INVOICE_PAY_STATUSES,
  ])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  }>({ key: 'invoiceNumber', direction: 'desc' })

  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    onCompleted: () => {
      toast.success('Invoice deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (uuid: DeleteInvoiceMutationVariables['uuid']) => {
    if (confirm('Are you sure you want to delete invoice ' + uuid + '?')) {
      deleteInvoice({ variables: { uuid } })
    }
  }

  // Count invoices by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    INVOICE_STATUSES.forEach((status) => {
      counts[status] = invoices.filter((i) => i.status === status).length
    })
    return counts
  }, [invoices])

  // Count invoices by pay status
  const payStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    INVOICE_PAY_STATUSES.forEach((payStatus) => {
      counts[payStatus] = invoices.filter(
        (i) => i.payStatus === payStatus
      ).length
    })
    return counts
  }, [invoices])

  // Filter invoices by selected statuses and pay statuses
  const filteredInvoices = useMemo(() => {
    let filtered = invoices
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((i) => selectedStatuses.includes(i.status))
    }
    if (selectedPayStatuses.length > 0) {
      filtered = filtered.filter((i) =>
        selectedPayStatuses.includes(i.payStatus)
      )
    }
    return filtered
  }, [invoices, selectedStatuses, selectedPayStatuses])

  const selectedInvoicesTotal = useMemo(
    () =>
      filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    [filteredInvoices]
  )

  const handleExportInvoices = () => {
    const exportData: any[] = []

    filteredInvoices.forEach((invoice) => {
      if (!invoice.billableItems || invoice.billableItems.length === 0) {
        exportData.push({
          invoiceUuid: invoice.uuid,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          payStatus: invoice.payStatus,
          total: invoice.total,
          subtotal: invoice.subtotal,
          taxTotal: invoice.taxTotal,
          payorEntityId: invoice.payorEntityId,
          payeeEntityId: invoice.payeeEntityId,
          jobAddressLine1: invoice.jobAddressLine1,
          jobAddressLine2: invoice.jobAddressLine2,
          jobCity: invoice.jobCity,
          jobState: invoice.jobState,
          jobPostalCode: invoice.jobPostalCode,
          jobCountry: invoice.jobCountry,
          createdAt: invoice.createdAt,
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
        invoice.billableItems.forEach((item) => {
          exportData.push({
            invoiceUuid: invoice.uuid,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            payStatus: invoice.payStatus,
            total: invoice.total,
            subtotal: invoice.subtotal,
            taxTotal: invoice.taxTotal,
            payorEntityId: invoice.payorEntityId,
            payeeEntityId: invoice.payeeEntityId,
            jobAddressLine1: invoice.jobAddressLine1,
            jobAddressLine2: invoice.jobAddressLine2,
            jobCity: invoice.jobCity,
            jobState: invoice.jobState,
            jobPostalCode: invoice.jobPostalCode,
            jobCountry: invoice.jobCountry,
            createdAt: invoice.createdAt,
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

    generateCSV(exportData, `${todayAsYYYYMMDD()}-invoices.csv`)
  }

  return (
    <div className="rw-segment">
      {/* Status filter dropdown */}
      <div className="flex items-center justify-between mb-4 space-y-2 sm:space-y-0 sm:flex-row flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-64">
              Filters ({selectedStatuses.length + selectedPayStatuses.length} )
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.length === INVOICE_STATUSES.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedStatuses([...INVOICE_STATUSES])
                } else {
                  setSelectedStatuses([])
                }
              }}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            {INVOICE_STATUSES.map((status) => (
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
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Pay Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={
                selectedPayStatuses.length === INVOICE_PAY_STATUSES.length
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPayStatuses([...INVOICE_PAY_STATUSES])
                } else {
                  setSelectedPayStatuses([])
                }
              }}
            >
              All Pay Statuses
            </DropdownMenuCheckboxItem>
            {INVOICE_PAY_STATUSES.map((payStatus) => (
              <DropdownMenuCheckboxItem
                key={payStatus}
                checked={selectedPayStatuses.includes(payStatus)}
                onCheckedChange={(checked) => {
                  setSelectedPayStatuses((prev) => {
                    if (checked) {
                      return [...prev, payStatus]
                    }
                    return prev.filter((s) => s !== payStatus)
                  })
                }}
              >
                {formatEnum(payStatus)} ({payStatusCounts[payStatus]})
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex space-x-4">
          <Badge variant="outline">
            <strong>
              {selectedStatuses.length + selectedPayStatuses.length}
            </strong>{' '}
            <small>Filter(s)</small>
          </Badge>
          <div className="text-2xl font-semibold">
            {currencyDisplay(selectedInvoicesTotal)}
          </div>
        </div>
        <div>&nbsp;</div>
      </div>

      {/* Table for filtered invoices */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl">No Invoices Found</p>
        </div>
      ) : (
        <div className="rw-table-wrapper-responsive">
          <InvoicesTable
            invoices={filteredInvoices}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            onDeleteClick={onDeleteClick}
            setOpenDrawerUuid={setOpenDrawerUuid}
            openDrawerUuid={openDrawerUuid}
          />
        </div>
      )}

      {/* Drawer for mobile details view */}
      {filteredInvoices.map((invoice) => (
        <Drawer
          key={`drawer-${invoice.uuid}`}
          open={openDrawerUuid === invoice.uuid}
          onOpenChange={(open) => setOpenDrawerUuid(open ? invoice.uuid : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Invoice Details</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <InvoiceDrawerContent
                invoice={invoice}
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
        disabled={filteredInvoices.length === 0}
        size="sm"
        onClick={handleExportInvoices}
      >
        Export Filtered Invoices ({filteredInvoices.length})
      </Button>
    </div>
  )
}

export default InvoicesList
