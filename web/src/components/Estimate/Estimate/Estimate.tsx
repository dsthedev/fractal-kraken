import { useState } from 'react'

import { gql } from '@apollo/client'
import type {
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables,
  FindEstimateById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import SendEstimateEmail from 'src/components/SendEstimateEmail/SendEstimateEmail'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'
import { createEstimateRefNo } from 'src/lib/utils'

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

interface Props {
  estimate: NonNullable<FindEstimateById['estimate']>
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

const formatAddress = (entity: any) => {
  if (!entity) return '...'
  const parts = [
    entity.addressLine1,
    entity.addressLine2,
    [entity.city, entity.state].filter(Boolean).join(', '),
    entity.postalCode,
    entity.country,
  ].filter(Boolean)
  return parts.join(', ') || '...'
}

const formatService = (obj: any) => {
  if (!obj) return '...'
  // Support legacy Service shape (action: enum string) and new relations (action: { name })
  const actionName =
    (obj.action && typeof obj.action === 'string' && obj.action) ||
    (obj.action && (obj.action.name || obj.action.fullName)) ||
    ''
  const materialName =
    (obj.material && typeof obj.material === 'string' && obj.material) ||
    (obj.material && (obj.material.name || '')) ||
    ''
  const context = obj.context ? ` (${obj.context})` : ''
  const combined = [actionName, materialName].filter(Boolean).join(' ')
  return `${combined}${context}`.trim() || '...'
}

const Estimate = ({ estimate }: Props) => {
  const [documentType, setDocumentType] = useState<'Estimate' | 'Invoice'>(
    'Invoice'
  )

  const toggleDocumentType = () => {
    setDocumentType((prev) => (prev === 'Estimate' ? 'Invoice' : 'Estimate'))
  }

  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
      navigate(routes.estimates())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

  // Sort billable items by sortOrder
  const sortedItems = [...(estimate.billableItems || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  )

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8 p-8 print:p-4 print:text-xs">
        {/* Top Half */}
        <div className="space-y-6">
          {/* Title Row */}
          <div className="border-b pb-4 flex space-x-4 justify-between items-center">
            <h1 className="text-3xl font-bold">{documentType}</h1>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleDocumentType}
              className="print:hidden"
            >
              Printing as {documentType}
            </Button>
          </div>

          {/* Date and Number Row */}
          <div className="flex justify-between gap-4 text-sm">
            <div>
              <span className="font-semibold">Date:</span>{' '}
              <Badge variant="outline">{todayAsYYYYMMDD()}</Badge>
            </div>
            <div className="text-right">
              <span className="font-semibold">No.</span>{' '}
              <Badge variant="outline">
                {estimate.title || '...'}
                {/* {createEstimateRefNo(
                  estimate.retailerEntity?.name,
                  estimate.clientEntity?.name
                )} */}
              </Badge>
            </div>
          </div>

          {/* Entities Section */}
          <div className="flex flex-col md:flex-row justify-between items- space-x-4 space-y-4 border-y py-2">
            {/* Installer */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Installer
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {estimate.installerEntity?.name || '...'}
                </span>
                {estimate.installerEntity?.phone && (
                  <span className="font-normal whitespace-nowrap">
                    <a href="tel:+{estimate.installerEntity.phone}">
                      {estimate.installerEntity.phone}
                    </a>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatAddress(estimate.installerEntity)}
              </div>
            </div>

            {/* Retailer */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Retailer
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {estimate.retailerEntity?.name || '...'}
                </span>
                {estimate.retailerEntity?.phone && (
                  <span className="font-normal whitespace-nowrap">
                    <a href="tel:+{estimate.retailerEntity.phone}">
                      {estimate.retailerEntity.phone}
                    </a>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatAddress(estimate.retailerEntity)}
              </div>
            </div>

            {/* Client */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Client
              </div>
              <div className="font-semibold flex md:flex-col">
                <span className="whitespace-nowrap">
                  {estimate.clientEntity?.name || '...'}
                </span>
                {estimate.clientEntity?.phone && (
                  <span className="font-normal whitespace-nowrap">
                    <a href="tel:+{estimate.clientEntity.phone}">
                      {estimate.clientEntity.phone}
                    </a>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {estimate.jobAddressLine1}
                {estimate.jobAddressLine2}
                {estimate.jobCity + estimate.jobState + estimate.jobPostalCode}
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
                <TableHead>Service / Material</TableHead>
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
                    <TableCell>{formatService(item)}</TableCell>
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

          {/* Signature and Total Row */}
          <div className="flex md:flex-row items-end pt-4 border-t">
            {/* Total */}
            <div className="md:order-2 text-right flex-grow">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block">
                {documentType} Total
              </label>
              <div className="text-3xl font-bold text-muted-foreground">
                {formatCurrency(estimate.total)}
              </div>
            </div>

            {/* Installer Signature */}
            <div className="md:order-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Installer Signature
              </label>
              <Input
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
            Estimate ID: <small>{estimate.uuid}</small>
          </div>
        </div>
      </div>

      {/* Send Estimate via Email Section */}
      <div className="mx-auto max-w-4xl border-t px-8 py-4 print:hidden">
        <SendEstimateEmail
          estimateId={estimate.id}
          entities={
            [
              estimate.installerEntity,
              estimate.retailerEntity,
              estimate.clientEntity,
            ].filter(Boolean) as (typeof estimate.installerEntity)[]
          }
        />
      </div>

      {/* Action Buttons - Hidden on Print */}
      <nav className="flex justify-center space-x-4s print:hidden">
        <Link
          to={routes.editEstimate({ id: estimate.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(estimate.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Estimate
