import type {
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  FindServiceById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters.js'

const DELETE_SERVICE_MUTATION: TypedDocumentNode<
  DeleteServiceMutation,
  DeleteServiceMutationVariables
> = gql`
  mutation DeleteServiceMutation($id: Int!) {
    deleteService(id: $id) {
      id
    }
  }
`

interface Props {
  service: NonNullable<FindServiceById['service']>
}

const Service = ({ service }: Props) => {
  const [deleteService] = useMutation(DELETE_SERVICE_MUTATION, {
    onCompleted: () => {
      toast.success('Service deleted')
      navigate(routes.services())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteServiceMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete service ' + id + '?')) {
      deleteService({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            {formatEnum(service.action)} {service.material} {service.context}
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            {/* <tr>
              <th>Id</th>
              <td>{service.id}</td>
            </tr> */}
            <tr>
              <th>Action</th>
              <td>{formatEnum(service.action)}</td>
            </tr>
            <tr>
              <th>Material</th>
              <td>{service.material}</td>
            </tr>
            <tr>
              <th>Context</th>
              <td>{service.context}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{service.description}</td>
            </tr>
            {/* <tr>
              <th>Created at</th>
              <td>{timeTag(service.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(service.updatedAt)}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editService({ id: service.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(service.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Service
