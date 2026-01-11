import type {
  CreateBillableItemMutation,
  CreateBillableItemInput,
  CreateBillableItemMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import BillableItemFormWrapper from 'src/components/BillableItem/BillableItemFormWrapper'

const CREATE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  CreateBillableItemMutation,
  CreateBillableItemMutationVariables
> = gql`
  mutation CreateBillableItemMutation($input: CreateBillableItemInput!) {
    createBillableItem(input: $input) {
      id
    }
  }
`

const NewBillableItem = () => {
  const [createBillableItem, { loading, error }] = useMutation(
    CREATE_BILLABLE_ITEM_MUTATION,
    {
      onCompleted: () => {
        toast.success('BillableItem created')
        navigate(routes.billableItems())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateBillableItemInput) => {
    createBillableItem({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New BillableItem</h2>
      </header>
      <div className="rw-segment-main">
        <BillableItemFormWrapper onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewBillableItem
