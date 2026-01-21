import type {
  EditBillableItemById,
  UpdateBillableItemInput,
  UpdateBillableItemMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import BillableItemFormWrapper from 'src/components/BillableItem/BillableItemFormWrapper'

export const QUERY: TypedDocumentNode<EditBillableItemById> = gql`
  query EditBillableItemById($id: Int!) {
    billableItem: billableItem(id: $id) {
      id
      actionId
      materialId
      unitId
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

const UPDATE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  EditBillableItemById,
  UpdateBillableItemMutationVariables
> = gql`
  mutation UpdateBillableItemMutation(
    $id: Int!
    $input: UpdateBillableItemInput!
  ) {
    updateBillableItem(id: $id, input: $input) {
      id
      actionId
      materialId
      unitId
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

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  billableItem,
}: CellSuccessProps<EditBillableItemById>) => {
  const [updateBillableItem, { loading, error }] = useMutation(
    UPDATE_BILLABLE_ITEM_MUTATION,
    {
      onCompleted: () => {
        toast.success('BillableItem updated')
        navigate(routes.billableItems())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateBillableItemInput,
    id: EditBillableItemById['billableItem']['id']
  ) => {
    updateBillableItem({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit BillableItem {billableItem?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <BillableItemFormWrapper
          billableItem={billableItem}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
