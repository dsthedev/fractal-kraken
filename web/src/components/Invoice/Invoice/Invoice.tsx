import type {
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables,
  FindInvoiceByUuid,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import SendInvoiceEmail from 'src/components/SendInvoiceEmail/SendInvoiceEmail'
import { Badge } from 'src/components/ui/badge'
import { Input } from 'src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'

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

interface Props {
  invoice: NonNullable<FindInvoiceByUuid['invoice']>
}

const todayAsYYYYMMDD = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '$0.00'
  const numAmount = Number(amount)
  return isNaN(numAmount) ? '$0.00' : `$${numAmount.toFixed(2)}`
}

const formatJobAddress = (invoice: any) => {
  const parts = [
    invoice.jobAddressLine1,
    invoice.jobAddressLine2,
    [invoice.jobCity, invoice.jobState].filter(Boolean).join(', '),
    invoice.jobPostalCode,
    invoice.jobCountry,
  ].filter(Boolean)
  return parts.join(', ') || '...'
}

const formatPayorAddress = (invoice: any) => {
  const parts = [
    invoice.payorAddressLine1,
    invoice.payorAddressLine2,
    [invoice.payorCity, invoice.payorState].filter(Boolean).join(', '),
    invoice.payorPostalCode,
    invoice.payorCountry,
  ].filter(Boolean)
  return parts.join(', ') || '...'
}

const formatPayeeAddress = (invoice: any) => {
  const parts = [
    invoice.payeeAddressLine1,
    invoice.payeeAddressLine2,
    [invoice.payeeCity, invoice.payeeState].filter(Boolean).join(', '),
    invoice.payeePostalCode,
    invoice.payeeCountry,
  ].filter(Boolean)
  return parts.join(', ') || '...'
}

const Invoice = ({ invoice }: Props) => {
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    onCompleted: () => {
      toast.success('Invoice deleted')
      navigate(routes.invoices())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (uuid: DeleteInvoiceMutationVariables['uuid']) => {
    if (confirm('Are you sure you want to delete invoice ' + uuid + '?')) {
      deleteInvoice({ variables: { uuid } })
    }
  }

  // Sort billable items by id (or sortOrder if available)
  const sortedItems = [...(invoice.billableItems || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  )

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8 p-8 print:p-4 print:text-xs">
        {/* Top Half */}
        <div className="space-y-6">
          {/* Title Row */}
          <div className="border-b pb-4 flex space-x-4 justify-between items-center">
            <h1 className="text-3xl font-bold">Invoice</h1>
          </div>

          {/* Date and Number Row */}
          <div className="flex justify-between gap-4 text-sm">
            <div>
              <span className="font-semibold">Date:</span>{' '}
              <Badge variant="outline">{todayAsYYYYMMDD()}</Badge>
            </div>
            <div className="text-right">
              <span className="font-semibold">No.</span>{' '}
              <Badge variant="outline">{invoice.invoiceNumber || '...'}</Badge>
            </div>
          </div>

          {/* Entities Section */}
          <div className="flex flex-col md:flex-row justify-between items-start space-x-4 space-y-4 border-y py-4">
            {/* Payee (Who is providing the service/invoice issuer) */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Payee (Bill From)
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {invoice.payeeName || invoice.payeeEntity?.name || '...'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPayeeAddress(invoice)}
              </div>
            </div>

            {/* Payor (Who is paying the invoice) */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Payor (Bill To)
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {invoice.payorName || invoice.payorEntity?.name || '...'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPayorAddress(invoice)}
              </div>
            </div>

            {/* Job */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Job
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {invoice.jobName || '...'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatJobAddress(invoice)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Half */}
        <div className="space-y-6">
          {/* Billable Items Table */}
          <Table>
            <TableHeader>
              <TableRow className="print:text-xs">
                <TableHead className="w-20 text-right">Qty</TableHead>
                <TableHead className="w-16">U/M</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24 text-right">Unit Price</TableHead>
                <TableHead className="w-24 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No billable items
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow key={item.id} className="text-xs">
                    <TableCell className="text-right text-lg p-1">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground p-1">
                      {item.unit?.shortName || '...'}
                    </TableCell>
                    <TableCell>
                      {[item.action?.name, item.material?.name]
                        .filter(Boolean)
                        .join(' ')}
                    </TableCell>
                    <TableCell className="text-muted-foreground p-1">
                      {item.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right p-1">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold p-1">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Total Row */}
          <div className="flex md:flex-row items-end pt-4 border-t">
            {/* Total */}
            <div className="md:order-2 text-right flex-grow">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Invoice Total
              </div>
              <div className="text-3xl font-bold text-muted-foreground">
                {formatCurrency(invoice.total)}
              </div>
            </div>

            {/* Signature Line */}
            <div className="md:order-1">
              <label
                htmlFor="auth-sig"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Authorized By
              </label>
              <Input
                id="auth-sig"
                type="text"
                disabled
                className="h-12 border-b border-t-0 border-x-0 rounded-none placeholder:text-gray-100"
                placeholder="Sign here"
              />
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="text-muted-foreground text-sm">
            Invoice ID: <small>{invoice.uuid}</small>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl border-t px-8 py-4 print:hidden">
        <SendInvoiceEmail
          invoiceUuid={invoice.uuid}
          entities={
            [
              invoice.sourceInstallerEntity,
              invoice.sourceRetailerEntity,
              invoice.sourceClientEntity,
            ].filter(Boolean) as (typeof invoice.sourceInstallerEntity)[]
          }
        />
      </div>

      {/* Action Buttons - Hidden on Print */}
      <nav className="mx-auto max-w-4xl border-t px-8 py-4 print:hidden flex justify-center space-x-4">
        <Link
          to={routes.editInvoice({ uuid: invoice.uuid })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(invoice.uuid)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Invoice
