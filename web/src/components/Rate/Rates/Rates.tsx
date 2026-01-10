import type {
  DeleteRateMutation,
  DeleteRateMutationVariables,
  FindRates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Rate/RatesCell'
import { timeTag, truncate } from 'src/lib/formatters.js'

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

const RatesList = ({ rates }: FindRates) => {
  const [deleteRate] = useMutation(DELETE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate deleted')
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

  const onDeleteClick = (id: DeleteRateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete rate ' + id + '?')) {
      deleteRate({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th>Service</th>
            <th>Unit</th>
            <th>Sub $</th>
            <th>Retail $</th>
            {/* <th>Currency</th> */}
            {/* <th>Author id</th> */}
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.id}>
              {/* <td>{truncate(rate.id)}</td> */}
              <td>{truncate(rate.serviceId)}</td>
              <td>{truncate(rate.unitId)}</td>
              <td>{truncate(rate.subAmount)}</td>
              <td>{truncate(rate.retailAmount)}</td>
              {/* <td>{truncate(rate.currency)}</td> */}
              {/* <td>{truncate(rate.authorId)}</td> */}
              {/* <td>{truncate(rate.description)}</td> */}
              {/* <td>{timeTag(rate.createdAt)}</td> */}
              {/* <td>{timeTag(rate.updatedAt)}</td> */}
              <td className="print:hidden">
                <nav className="rw-table-actions">
                  <Link
                    to={routes.rate({ id: rate.id })}
                    title={'Show rate ' + rate.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editRate({ id: rate.id })}
                    title={'Edit rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(rate.id)}
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

export default RatesList
