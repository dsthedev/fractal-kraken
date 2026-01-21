import type {
  EditActionById,
  UpdateActionInput,
  UpdateActionMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ActionForm from 'src/components/Action/ActionForm'

export const QUERY: TypedDocumentNode<EditActionById> = gql`
  query EditActionById($id: Int!) {
    action: action(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`

const UPDATE_ACTION_MUTATION: TypedDocumentNode<
  EditActionById,
  UpdateActionMutationVariables
> = gql`
  mutation UpdateActionMutation($id: Int!, $input: UpdateActionInput!) {
    updateAction(id: $id, input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ action }: CellSuccessProps<EditActionById>) => {
  const [updateAction, { loading, error }] = useMutation(
    UPDATE_ACTION_MUTATION,
    {
      onCompleted: () => {
        toast.success('Action updated')
        navigate(routes.actions())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateActionInput,
    id: EditActionById['action']['id']
  ) => {
    updateAction({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Action {action?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ActionForm
          action={action}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
