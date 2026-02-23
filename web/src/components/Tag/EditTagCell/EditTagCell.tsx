import type {
  EditTagById,
  UpdateTagInput,
  UpdateTagMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import TagForm from 'src/components/Tag/TagForm'

export const QUERY: TypedDocumentNode<EditTagById> = gql`
  query EditTagById($id: Int!) {
    tag: tag(id: $id) {
      id
      name
      description
      authorId
      createdAt
      updatedAt
    }
  }
`

const UPDATE_TAG_MUTATION: TypedDocumentNode<
  EditTagById,
  UpdateTagMutationVariables
> = gql`
  mutation UpdateTagMutation($id: Int!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      name
      description
      authorId
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ tag }: CellSuccessProps<EditTagById>) => {
  const [updateTag, { loading, error }] = useMutation(UPDATE_TAG_MUTATION, {
    onCompleted: () => {
      toast.success('Tag updated')
      navigate(routes.tags())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: UpdateTagInput, id: EditTagById['tag']['id']) => {
    updateTag({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Tag {tag?.id}</h2>
      </header>
      <div className="rw-segment-main">
        <TagForm tag={tag} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
