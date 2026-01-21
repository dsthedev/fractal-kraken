import type {
  DeleteRateMutation,
  DeleteRateMutationVariables,
  FindRateById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag, currencyDisplay } from 'src/lib/formatters.js'

const DELETE_RATE_MUTATION: TypedDocumentNode<
  DeleteRateMutation,
  DeleteRateMutationVariables
> = gql`
  mutation DeleteRateMutation($id: Int!) {
    deleteRate(id: $id) {
      id
    }
  }
`

interface Props {
  rate: NonNullable<FindRateById['rate']>
}

const Rate = ({ rate }: Props) => {
  const [deleteRate] = useMutation(DELETE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate deleted')
      navigate(routes.rates())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteRateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete rate ' + id + '?')) {
      deleteRate({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            {rate.action?.name} {rate.material?.name} {rate.context || ''}
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            {/* <tr>
              <th>Id</th>
              <td>{rate.id}</td>
            </tr> */}
            <tr>
              <th>Service</th>
              <td>
                {rate.action?.name} {rate.material?.name} {rate.context || ''}
              </td>
            </tr>
            <tr>
              <th>Unit</th>
              <td>{rate.unit.fullName}</td>
            </tr>
            <tr>
              <th>Sub amount</th>
              <td>{currencyDisplay(rate.subAmount)}</td>
            </tr>
            <tr>
              <th>Retail amount</th>
              <td>{currencyDisplay(rate.retailAmount)}</td>
            </tr>
            <tr>
              <th>Currency</th>
              <td>{rate.currency}</td>
            </tr>
            <tr>
              <th>Est. Min. per Unit</th>
              <td>{rate.estimatedMinutesPerUnit}</td>
            </tr>
            {/* <tr>
              <th>Author id</th>
              <td>{rate.authorId}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{rate.description}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(rate.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(rate.updatedAt)}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editRate({ id: rate.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(rate.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Rate
