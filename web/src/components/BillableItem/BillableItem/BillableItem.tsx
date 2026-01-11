import type {
  DeleteBillableItemMutation,
  DeleteBillableItemMutationVariables,
  FindBillableItemById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { formatEnum } from 'src/lib/formatters.js'

const DELETE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  DeleteBillableItemMutation,
  DeleteBillableItemMutationVariables
> = gql`
  mutation DeleteBillableItemMutation($id: Int!) {
    deleteBillableItem(id: $id) {
      id
    }
  }
`

interface Props {
  billableItem: NonNullable<FindBillableItemById['billableItem']>
}

const BillableItem = ({ billableItem }: Props) => {
  const [deleteBillableItem] = useMutation(DELETE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => {
      toast.success('BillableItem deleted')
      navigate(routes.billableItems())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteBillableItemMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete billableItem ' + id + '?')) {
      deleteBillableItem({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            BillableItem Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Service</th>
              <td>
                {formatEnum(billableItem.service?.action)}{' '}
                {billableItem.service?.material} {billableItem.service?.context}
              </td>
            </tr>
            <tr>
              <th>Unit</th>
              <td>{billableItem.unit?.shortName}</td>
            </tr>
            <tr>
              <th>Unit price</th>
              <td>{billableItem.unitPrice}</td>
            </tr>
            <tr>
              <th>Pricing type</th>
              <td>{formatEnum(billableItem.pricingType)}</td>
            </tr>
            <tr>
              <th>Quantity</th>
              <td>{billableItem.quantity}</td>
            </tr>
            <tr>
              <th>Subtotal</th>
              <td>{billableItem.subtotal}</td>
            </tr>
            <tr>
              <th>Estimated minutes per unit</th>
              <td>{billableItem.estimatedMinutesPerUnit}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{billableItem.notes}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editBillableItem({ id: billableItem.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(billableItem.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default BillableItem
