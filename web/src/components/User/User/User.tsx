import type {
  DeleteUserMutation,
  DeleteUserMutationVariables,
  FindUserById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag } from 'src/lib/formatters.js'

const DELETE_USER_MUTATION: TypedDocumentNode<
  DeleteUserMutation,
  DeleteUserMutationVariables
> = gql`
  mutation DeleteUserMutation($id: String!) {
    deleteUser(id: $id) {
      id
    }
  }
`

interface Props {
  user: NonNullable<FindUserById['user']>
}

const User = ({ user }: Props) => {
  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User deleted')
      navigate(routes.users())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteUserMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete user ' + id + '?')) {
      deleteUser({ variables: { id } })
    }
  }

  return (
    <>
      <div className="flex justify-center max-w-lg mx-auto">
        <div className="rw-segment">
          <header className="rw-segment-header">
            <h2 className="rw-heading rw-heading-secondary">{user.email}</h2>
          </header>
          <table className="rw-table">
            <tbody>
              <tr>
                <th>Name</th>
                <td>{user.name}</td>
              </tr>
              <tr>
                <th>Roles</th>
                <td>{user.roles}</td>
              </tr>
              <tr>
                <th>Created at</th>
                <td>{timeTag(user.createdAt)}</td>
              </tr>
              <tr>
                <th>Updated at</th>
                <td>{timeTag(user.updatedAt)}</td>
              </tr>
            </tbody>
          </table>
          <nav className="rw-button-group">
            <Link
              to={routes.editUser({ id: user.id })}
              className="rw-button rw-button-blue"
            >
              Edit
            </Link>
            <button
              type="button"
              className="rw-button rw-button-red"
              onClick={() => onDeleteClick(user.id)}
            >
              Delete
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

export default User
