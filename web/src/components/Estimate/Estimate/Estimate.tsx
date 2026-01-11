import type {
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables,
  FindEstimateById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters.js'

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

interface Props {
  estimate: NonNullable<FindEstimateById['estimate']>
}

const Estimate = ({ estimate }: Props) => {
  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
      navigate(routes.estimates())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Estimate {estimate.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{estimate.id}</td>
            </tr>
            <tr>
              <th>Uuid</th>
              <td>{estimate.uuid}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{estimate.title}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{formatEnum(estimate.status)}</td>
            </tr>
            <tr>
              <th>Installer entity id</th>
              <td>{estimate.installerEntityId}</td>
            </tr>
            <tr>
              <th>Client entity id</th>
              <td>{estimate.clientEntityId}</td>
            </tr>
            <tr>
              <th>Retailer entity id</th>
              <td>{estimate.retailerEntityId}</td>
            </tr>
            <tr>
              <th>Job address line1</th>
              <td>{estimate.jobAddressLine1}</td>
            </tr>
            <tr>
              <th>Job address line2</th>
              <td>{estimate.jobAddressLine2}</td>
            </tr>
            <tr>
              <th>Job city</th>
              <td>{estimate.jobCity}</td>
            </tr>
            <tr>
              <th>Job state</th>
              <td>{estimate.jobState}</td>
            </tr>
            <tr>
              <th>Job postal code</th>
              <td>{estimate.jobPostalCode}</td>
            </tr>
            <tr>
              <th>Job country</th>
              <td>{estimate.jobCountry}</td>
            </tr>
            <tr>
              <th>Subtotal</th>
              <td>{estimate.subtotal}</td>
            </tr>
            <tr>
              <th>Tax total</th>
              <td>{estimate.taxTotal}</td>
            </tr>
            <tr>
              <th>Total</th>
              <td>{estimate.total}</td>
            </tr>
            <tr>
              <th>Estimated minutes total</th>
              <td>{estimate.estimatedMinutesTotal}</td>
            </tr>
            <tr>
              <th>Author id</th>
              <td>{estimate.authorId}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{estimate.notes}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(estimate.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(estimate.updatedAt)}</td>
            </tr>
            <tr>
              <th>Entity id</th>
              <td>{estimate.entityId}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editEstimate({ id: estimate.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(estimate.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Estimate
