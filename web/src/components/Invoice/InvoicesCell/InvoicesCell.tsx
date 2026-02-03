import type { FindInvoices, FindInvoicesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Invoices from 'src/components/Invoice/Invoices'
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
