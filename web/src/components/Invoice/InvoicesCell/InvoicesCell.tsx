import type { FindInvoices, FindInvoicesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Invoices from 'src/components/Invoice/Invoices'

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
        payeeAddressLine1
        payeeAddressLine2
        payeeCity
        payeeState
        payeePostalCode
        payeeCountry
        payorAddressLine1
        payorAddressLine2
        payorCity
        payorState
        payorPostalCode
        payorCountry
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
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No invoices yet.{' '}
      <Link to={routes.newInvoice()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindInvoices>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  invoices,
}: CellSuccessProps<FindInvoices, FindInvoicesVariables>) => {
  return <Invoices invoices={invoices} />
}
