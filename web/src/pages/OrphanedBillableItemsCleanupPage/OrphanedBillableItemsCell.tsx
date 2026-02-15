import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'
import type {
  FindOrphanedBillableItems,
  FindOrphanedBillableItemsVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import { OrphanedBillableItemsList } from './OrphanedBillableItemsList.tsx'

export const QUERY: TypedDocumentNode<
  FindOrphanedBillableItems,
  FindOrphanedBillableItemsVariables
> = gql`
  query FindOrphanedBillableItems {
    orphanedBillableItems {
      id
      actionId
      action {
        id
        name
      }
      materialId
      material {
        id
        name
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
      author {
        id
        name
      }
      createdAt
      updatedAt
      estimateId
      invoiceUuid
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return <div className="rw-text-center">No orphaned billable items found.</div>
}

export const Failure = ({
  error,
}: CellFailureProps<FindOrphanedBillableItems>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  orphanedBillableItems,
}: CellSuccessProps<
  FindOrphanedBillableItems,
  FindOrphanedBillableItemsVariables
>) => {
  return <OrphanedBillableItemsList items={orphanedBillableItems} />
}

const OrphanedBillableItemsCell = () => {
  const { data, loading, error } = useQuery<
    FindOrphanedBillableItems,
    FindOrphanedBillableItemsVariables
  >(QUERY)

  if (loading) return <Loading />
  if (error) return <Failure error={error} />
  if (!data?.orphanedBillableItems?.length) return <Empty />

  return <Success orphanedBillableItems={data.orphanedBillableItems} />
}

export default OrphanedBillableItemsCell
