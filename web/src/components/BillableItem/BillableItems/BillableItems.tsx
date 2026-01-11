import type {
  DeleteBillableItemMutation,
  DeleteBillableItemMutationVariables,
  FindBillableItems,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/BillableItem/BillableItemsCell'
import { calculateSubtotal } from 'src/lib/calculations'
import { currencyDisplay, formatEnum, truncate } from 'src/lib/formatters.js'

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

const BillableItemsList = ({ billableItems }: FindBillableItems) => {
  const [deleteBillableItem] = useMutation(DELETE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => {
      toast.success('BillableItem deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteBillableItemMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete billableItem ' + id + '?')) {
      deleteBillableItem({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Service</th>
            {/* <th>Unit</th> */}
            <th>Unit price</th>
            {/* <th>Pricing type</th> */}
            <th>Qty</th>
            <th>Subtotal</th>
            {/* <th>Estimated minutes per unit</th> */}
            {/* <th>Notes</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {billableItems.map((billableItem) => (
            <tr key={billableItem.id}>
              <td>
                {truncate(formatEnum(billableItem.service?.action))}{' '}
                {truncate(billableItem.service?.material)}{' '}
                {truncate(billableItem.service?.context)}
              </td>
              <td>
                {currencyDisplay(billableItem.unitPrice)}/
                {truncate(billableItem.unit?.shortName)}
              </td>
              {/* <td>{truncate(billableItem.unit?.shortName)}</td> */}
              {/* <td>{formatEnum(billableItem.pricingType)}</td> */}
              <td>{truncate(billableItem.quantity)}</td>
              <td>
                {currencyDisplay(
                  calculateSubtotal(
                    billableItem.unitPrice,
                    billableItem.quantity
                  )
                )}
              </td>
              {/* <td>{truncate(billableItem.estimatedMinutesPerUnit)}</td> */}
              {/* <td>{truncate(billableItem.notes)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.billableItem({ id: billableItem.id })}
                    title={'Show billableItem ' + billableItem.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editBillableItem({ id: billableItem.id })}
                    title={'Edit billableItem ' + billableItem.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete billableItem ' + billableItem.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(billableItem.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BillableItemsList
