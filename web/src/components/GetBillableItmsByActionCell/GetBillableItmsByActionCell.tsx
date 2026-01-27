import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import { BillableItemsList } from 'src/components/BillableItems/BillableItemsList'

export const QUERY: TypedDocumentNode<any, any> = gql`
  query FindGetBillableItmsByActionQuery($id: Int!) {
    action(id: $id) {
      id
      billableItems {
        id
        notes
        quantity
        unitPrice
        pricingType
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>No billable items found</div>

export const Failure = ({ error }: CellFailureProps<any>) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

export const Success = (
  { action }: CellSuccessProps<any, any>,
  props?: { displayCount?: boolean }
) => (
  <BillableItemsList
    items={action?.billableItems || []}
    displayCount={props?.displayCount}
  />
)
