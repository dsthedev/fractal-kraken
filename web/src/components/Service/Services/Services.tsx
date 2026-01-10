import type {
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  FindServices,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Service/ServicesCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters.js'

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

const ServicesList = ({ services }: FindServices) => {
  const [deleteService] = useMutation(DELETE_SERVICE_MUTATION, {
    onCompleted: () => {
      toast.success('Service deleted')
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

  const onDeleteClick = (id: DeleteServiceMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete service ' + id + '?')) {
      deleteService({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th>Action</th>
            <th>Material</th>
            <th>Context</th>
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              {/* <td>{truncate(service.id)}</td> */}
              <td>{formatEnum(service.action)}</td>
              <td>{truncate(service.material)}</td>
              <td>{truncate(service.context)}</td>
              {/* <td>{truncate(service.description)}</td> */}
              {/* <td>{timeTag(service.createdAt)}</td> */}
              {/* <td>{timeTag(service.updatedAt)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.service({ id: service.id })}
                    title={'Show service ' + service.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editService({ id: service.id })}
                    title={'Edit service ' + service.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete service ' + service.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(service.id)}
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

export default ServicesList
