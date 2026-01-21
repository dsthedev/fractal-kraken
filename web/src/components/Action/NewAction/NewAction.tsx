import type {
  CreateActionMutation,
  CreateActionInput,
  CreateActionMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ActionForm from 'src/components/Action/ActionForm'

const CREATE_ACTION_MUTATION: TypedDocumentNode<
  CreateActionMutation,
  CreateActionMutationVariables
> = gql`
  mutation CreateActionMutation($input: CreateActionInput!) {
    createAction(input: $input) {
      id
    }
  }
`

const NewAction = () => {
  const [createAction, { loading, error }] = useMutation(
    CREATE_ACTION_MUTATION,
    {
      onCompleted: () => {
        toast.success('Action created')
        navigate(routes.actions())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateActionInput) => {
    createAction({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Action</h2>
      </header>
      <div className="rw-segment-main">
        <ActionForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewAction
