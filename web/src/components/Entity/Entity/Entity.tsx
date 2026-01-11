import type {
  DeleteEntityMutation,
  DeleteEntityMutationVariables,
  FindEntityById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters.js'

const DELETE_ENTITY_MUTATION: TypedDocumentNode<
  DeleteEntityMutation,
  DeleteEntityMutationVariables
> = gql`
  mutation DeleteEntityMutation($id: Int!) {
    deleteEntity(id: $id) {
      id
    }
  }
`

interface Props {
  entity: NonNullable<FindEntityById['entity']>
}

const Entity = ({ entity }: Props) => {
  const [deleteEntity] = useMutation(DELETE_ENTITY_MUTATION, {
    onCompleted: () => {
      toast.success('Entity deleted')
      navigate(routes.entities())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteEntityMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete entity ' + id + '?')) {
      deleteEntity({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Entity {entity.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            {/* <tr>
              <th>Id</th>
              <td>{entity.id}</td>
            </tr> */}
            <tr>
              <th>Type</th>
              <td>{formatEnum(entity.type)}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{entity.name}</td>
            </tr>
            <tr>
              <th>Contact name</th>
              <td>{entity.contactName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{entity.email}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{entity.phone}</td>
            </tr>
            <tr>
              <th>Address line1</th>
              <td>{entity.addressLine1}</td>
            </tr>
            <tr>
              <th>Address line2</th>
              <td>{entity.addressLine2}</td>
            </tr>
            <tr>
              <th>City</th>
              <td>{entity.city}</td>
            </tr>
            <tr>
              <th>State</th>
              <td>{entity.state}</td>
            </tr>
            <tr>
              <th>Postal code</th>
              <td>{entity.postalCode}</td>
            </tr>
            <tr>
              <th>Country</th>
              <td>{entity.country}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{entity.notes}</td>
            </tr>
            {/* <tr>
              <th>Created at</th>
              <td>{timeTag(entity.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(entity.updatedAt)}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editEntity({ id: entity.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(entity.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Entity
