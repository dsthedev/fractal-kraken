import type {
  DeleteActionMutation,
  DeleteActionMutationVariables,
  FindActionById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag } from 'src/lib/formatters.js'

const DELETE_ACTION_MUTATION: TypedDocumentNode<
  DeleteActionMutation,
  DeleteActionMutationVariables
> = gql`
  mutation DeleteActionMutation($id: Int!) {
    deleteAction(id: $id) {
      id
    }
  }
`

interface Props {
  action: NonNullable<FindActionById['action']>
}

const Action = ({ action }: Props) => {
  const [deleteAction] = useMutation(DELETE_ACTION_MUTATION, {
    onCompleted: () => {
      toast.success('Action deleted')
      navigate(routes.actions())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteActionMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete action ' + id + '?')) {
      deleteAction({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Action {action.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{action.id}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{action.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{action.description}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(action.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(action.updatedAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editAction({ id: action.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(action.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Action
