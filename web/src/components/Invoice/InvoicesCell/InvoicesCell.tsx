import { InfoIcon } from 'lucide-react'
import type { FindInvoices, FindInvoicesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Invoices from 'src/components/Invoice/Invoices'
import { Alert, AlertDescription, AlertTitle } from 'src/components/ui/alert'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindInvoices, FindInvoicesVariables> =
  gql`
    query FindInvoices {
      invoices {
        uuid
        createdAt
        updatedAt
        authorId
        invoiceNumber
        status
        payStatus
        jobStartedAt
        jobFinishedAt
        dueAt
        paidAt
        payorEntityId
        payeeEntityId
        sourceEstimateId
        sourceInstallerEntityId
        sourceClientEntityId
        sourceRetailerEntityId
        payeeName
        payeeAddressLine1
        payeeAddressLine2
        payeeCity
        payeeState
        payeePostalCode
        payeeCountry
        payorName
        payorAddressLine1
        payorAddressLine2
        payorCity
        payorState
        payorPostalCode
        payorCountry
        jobName
        jobAddressLine1
        jobAddressLine2
        jobCity
        jobState
        jobPostalCode
        jobCountry
        subtotal
        taxTotal
        total
        notes
        entityId
        payorEntity {
          id
          type
          name
          nickname
          contactName
        }
        payeeEntity {
          id
          type
          name
          nickname
          contactName
        }
        billableItems {
          id
          actionId
          materialId
          unitId
          quantity
          unitPrice
          subtotal
          action {
            id
            name
          }
          material {
            id
            name
          }
          unit {
            id
            fullName
          }
        }
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl">No Invoices... Yet!</h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              An invoice is a formal request for payment for work completed. It
              locks in the details and tracks payment status.
            </p>

            <div className="rounded-md border p-3 text-left text-sm">
              <ul className="space-y-1">
                <li>
                  <strong>Payment Tracking:</strong> Monitor paid, pending, and
                  overdue amounts
                </li>
                <li>
                  <strong>Job Completion:</strong> Record when work started and
                  finished
                </li>
                <li>
                  <strong>Financial Records:</strong> Locked line items and
                  totals
                </li>
                <li>
                  <strong>Payor & Payee:</strong> Track who owes and who gets
                  paid
                </li>
              </ul>
            </div>

            <Alert variant="default">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Tip: Convert Estimates</AlertTitle>
              <AlertDescription>
                Create invoices by converting approved estimates.{' '}
                <Link
                  to={routes.estimates()}
                  className="underline hover:no-underline font-semibold"
                >
                  View Estimates
                </Link>
              </AlertDescription>
            </Alert>
          </div>

          <Button asChild variant="lime" size="lg" className="w-full">
            <Link to={routes.newInvoice()}>Create an Invoice</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindInvoices>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  invoices,
}: CellSuccessProps<FindInvoices, FindInvoicesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = invoices.filter((invoice) => {
    const searchable = [
      invoice.invoiceNumber || '',
      invoice.status || '',
      invoice.payStatus || '',
      invoice.payorName || '',
      invoice.payorEntity?.name || '',
      invoice.payorEntity?.nickname || '',
      invoice.payorEntity?.contactName || '',
      invoice.payeeName || '',
      invoice.payeeEntity?.name || '',
      invoice.payeeEntity?.nickname || '',
      invoice.payeeEntity?.contactName || '',
      invoice.jobName || '',
      invoice.jobAddressLine1 || '',
      invoice.jobAddressLine2 || '',
      invoice.jobCity || '',
      invoice.jobState || '',
      invoice.notes || '',
    ]
      .join(' ')
      .toLowerCase()
    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Invoices invoices={filtered} />
}
