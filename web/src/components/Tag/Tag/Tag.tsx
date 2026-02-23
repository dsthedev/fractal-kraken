import type {
  DeleteTagMutation,
  DeleteTagMutationVariables,
  FindTagById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag } from 'src/lib/formatters.js'

const DELETE_TAG_MUTATION: TypedDocumentNode<
  DeleteTagMutation,
  DeleteTagMutationVariables
> = gql`
  mutation DeleteTagMutation($id: Int!) {
    deleteTag(id: $id) {
      id
    }
  }
`

interface Props {
  tag: NonNullable<FindTagById['tag']>
}

const Tag = ({ tag }: Props) => {
  const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
    onCompleted: () => {
      toast.success('Tag deleted')
      navigate(routes.tags())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteTagMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete tag ' + id + '?')) {
      deleteTag({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Tag {tag.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{tag.id}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{tag.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{tag.description}</td>
            </tr>
            <tr>
              <th>Author id</th>
              <td>{tag.authorId}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(tag.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(tag.updatedAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editTag({ id: tag.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(tag.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Tag
