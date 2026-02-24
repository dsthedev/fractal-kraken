import { Pencil, Trash2 } from 'lucide-react'
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
import { truncate } from 'src/lib/formatters.js'

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

const TagsList = ({
  tags,
  refetch,
}: FindTags & { refetch?: () => Promise<any> }) => {
  const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
    onCompleted: () => {
      toast.success('Tag deleted')
      refetch?.()
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
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>{truncate(tag.name)}</td>
              <td>{truncate(tag.description)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editTag({ id: tag.id })}
                    title={'Edit tag ' + tag.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil />
                  </Link>
                  <button
                    type="button"
                    title={'Delete tag ' + tag.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(tag.id)}
                  >
                    <Trash2 />
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
