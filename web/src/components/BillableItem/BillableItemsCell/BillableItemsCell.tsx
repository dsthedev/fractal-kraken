import type {
  FindBillableItems,
  FindBillableItemsVariables,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import BillableItems from 'src/components/BillableItem/BillableItems'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<
  FindBillableItems,
  FindBillableItemsVariables
> = gql`
  query FindBillableItems {
    billableItems {
      id
      serviceId
      service {
        id
        action
        material
        context
      }
      unitId
      unit {
        id
        fullName
        shortName
      }
      unitPrice
      pricingType
      quantity
      subtotal
      estimatedMinutesPerUnit
      notes
      authorId
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No billableItems yet.{' '}
      <Link to={routes.newBillableItem()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindBillableItems>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  billableItems,
}: CellSuccessProps<FindBillableItems, FindBillableItemsVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = billableItems.filter((item) => {
    const searchable = [
      item.service?.action || '',
      item.service?.material || '',
      item.service?.context || '',
      item.unit?.fullName || '',
      item.unit?.shortName || '',
      item.notes || '',
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return <BillableItems billableItems={filtered} />
}
