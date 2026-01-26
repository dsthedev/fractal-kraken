import type {
  CreateEntityMutation,
  CreateEntityInput,
  CreateEntityMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EntityForm from 'src/components/Entity/EntityForm'

const CREATE_ENTITY_MUTATION: TypedDocumentNode<
  CreateEntityMutation,
  CreateEntityMutationVariables
> = gql`
  mutation CreateEntityMutation($input: CreateEntityInput!) {
    createEntity(input: $input) {
      id
      authorId
      author {
        id
        email
      }
    }
  }
`

const NewEntity = () => {
  const [createEntity, { loading, error }] = useMutation(
    CREATE_ENTITY_MUTATION,
    {
      onCompleted: () => {
        toast.success('Entity created')
        navigate(routes.entities())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateEntityInput) => {
    createEntity({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Entity</h2>
      </header>
      <div className="rw-segment-main">
        <EntityForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEntity
