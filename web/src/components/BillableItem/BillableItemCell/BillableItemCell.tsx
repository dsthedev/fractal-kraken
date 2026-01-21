import type {
  FindBillableItemById,
  FindBillableItemByIdVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import BillableItem from 'src/components/BillableItem/BillableItem'

export const QUERY: TypedDocumentNode<
  FindBillableItemById,
  FindBillableItemByIdVariables
> = gql`
  query FindBillableItemById($id: Int!) {
    billableItem: billableItem(id: $id) {
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
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>BillableItem not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindBillableItemByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  billableItem,
}: CellSuccessProps<FindBillableItemById, FindBillableItemByIdVariables>) => {
  return <BillableItem billableItem={billableItem} />
}
