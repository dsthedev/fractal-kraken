import { Pencil, Trash2 } from 'lucide-react'
import type {
  DeleteEntityMutation,
  DeleteEntityMutationVariables,
  FindEntities,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Entity/EntitiesCell'
import { truncate } from 'src/lib/formatters.js'

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

const EntitiesList = ({ entities }: FindEntities) => {
  const [deleteEntity] = useMutation(DELETE_ENTITY_MUTATION, {
    onCompleted: () => {
      toast.success('Entity deleted')
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

  const onDeleteClick = (id: DeleteEntityMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete entity ' + id + '?')) {
      deleteEntity({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            {/* <th>Type</th> */}
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            {/* <th>Address line1</th>
            <th>Address line2</th>
            <th>City</th>
            <th>State</th>
            <th>Postal code</th>
            <th>Country</th>
            <th>Notes</th>
            <th>Created at</th>
            <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr key={entity.id}>
              {/* <td>{truncate(entity.id)}</td> */}
              {/* <td>{formatEnum(entity.type)}</td> */}
              <td>
                <Link
                  to={routes.entity({ id: entity.id })}
                  title={'Show ' + entity.name + ' details'}
                >
                  {truncate(entity.name)}
                </Link>
              </td>
              <td>{truncate(entity.contactName)}</td>
              <td>{truncate(entity.email)}</td>
              <td>{truncate(entity.phone)}</td>
              {/* <td>{truncate(entity.addressLine1)}</td>
              <td>{truncate(entity.addressLine2)}</td>
              <td>{truncate(entity.city)}</td>
              <td>{truncate(entity.state)}</td>
              <td>{truncate(entity.postalCode)}</td>
              <td>{truncate(entity.country)}</td>
              <td>{truncate(entity.notes)}</td>
              <td>{timeTag(entity.createdAt)}</td>
              <td>{timeTag(entity.updatedAt)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editEntity({ id: entity.id })}
                    title={'Edit ' + entity.name}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    title={'Delete ' + entity.name}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(entity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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

export default EntitiesList
