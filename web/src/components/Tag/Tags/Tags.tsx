import type {
  DeleteTagMutation,
  DeleteTagMutationVariables,
  FindTags,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Tag/TagsCell'
import { timeTag, truncate } from 'src/lib/formatters.js'

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

const TagsList = ({ tags }: FindTags) => {
  const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
    onCompleted: () => {
      toast.success('Tag deleted')
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

  const onDeleteClick = (id: DeleteTagMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete tag ' + id + '?')) {
      deleteTag({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Description</th>
            <th>Author id</th>
            <th>Created at</th>
            <th>Updated at</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>{truncate(tag.id)}</td>
              <td>{truncate(tag.name)}</td>
              <td>{truncate(tag.description)}</td>
              <td>{truncate(tag.authorId)}</td>
              <td>{timeTag(tag.createdAt)}</td>
              <td>{timeTag(tag.updatedAt)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.tag({ id: tag.id })}
                    title={'Show tag ' + tag.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editTag({ id: tag.id })}
                    title={'Edit tag ' + tag.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete tag ' + tag.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(tag.id)}
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

export default TagsList
