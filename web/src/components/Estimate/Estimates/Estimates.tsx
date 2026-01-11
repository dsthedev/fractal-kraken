import type {
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables,
  FindEstimates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Estimate/EstimatesCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters.js'

const DELETE_ESTIMATE_MUTATION: TypedDocumentNode<
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables
> = gql`
  mutation DeleteEstimateMutation($id: Int!) {
    deleteEstimate(id: $id) {
      id
    }
  }
`

const EstimatesList = ({ estimates }: FindEstimates) => {
  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
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

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Uuid</th>
            <th>Title</th>
            <th>Status</th>
            <th>Installer entity id</th>
            <th>Client entity id</th>
            <th>Retailer entity id</th>
            <th>Job address line1</th>
            <th>Job address line2</th>
            <th>Job city</th>
            <th>Job state</th>
            <th>Job postal code</th>
            <th>Job country</th>
            <th>Subtotal</th>
            <th>Tax total</th>
            <th>Total</th>
            <th>Estimated minutes total</th>
            <th>Author id</th>
            <th>Notes</th>
            <th>Created at</th>
            <th>Updated at</th>
            <th>Entity id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => (
            <tr key={estimate.id}>
              <td>{truncate(estimate.id)}</td>
              <td>{truncate(estimate.uuid)}</td>
              <td>{truncate(estimate.title)}</td>
              <td>{formatEnum(estimate.status)}</td>
              <td>{truncate(estimate.installerEntityId)}</td>
              <td>{truncate(estimate.clientEntityId)}</td>
              <td>{truncate(estimate.retailerEntityId)}</td>
              <td>{truncate(estimate.jobAddressLine1)}</td>
              <td>{truncate(estimate.jobAddressLine2)}</td>
              <td>{truncate(estimate.jobCity)}</td>
              <td>{truncate(estimate.jobState)}</td>
              <td>{truncate(estimate.jobPostalCode)}</td>
              <td>{truncate(estimate.jobCountry)}</td>
              <td>{truncate(estimate.subtotal)}</td>
              <td>{truncate(estimate.taxTotal)}</td>
              <td>{truncate(estimate.total)}</td>
              <td>{truncate(estimate.estimatedMinutesTotal)}</td>
              <td>{truncate(estimate.authorId)}</td>
              <td>{truncate(estimate.notes)}</td>
              <td>{timeTag(estimate.createdAt)}</td>
              <td>{timeTag(estimate.updatedAt)}</td>
              <td>{truncate(estimate.entityId)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.estimate({ id: estimate.id })}
                    title={'Show estimate ' + estimate.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editEstimate({ id: estimate.id })}
                    title={'Edit estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(estimate.id)}
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

export default EstimatesList
