import type {
  CreateEntityMutation,
  CreateEntityInput,
  CreateEntityMutationVariables,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EntityForm from 'src/components/Entity/EntityForm'
import { QUERY } from 'src/components/User/EntitySelectorCell/EntitySelectorCell'

const CREATE_ENTITY_MUTATION: TypedDocumentNode<
  CreateEntityMutation,
  CreateEntityMutationVariables
> = gql`
  mutation CreateEntityInDialogMutation($input: CreateEntityInput!) {
    createEntity(input: $input) {
      id
    }
  }
`

type NewEntityDialogProps = {
  onClose: () => void
}

const NewEntityDialog = ({ onClose }: NewEntityDialogProps) => {
  const [createEntity, { loading, error }] = useMutation(
    CREATE_ENTITY_MUTATION,
    {
      onCompleted: () => {
        toast.success('Entity created successfully')
        onClose()
      },
      onError: (error) => {
        toast.error(error.message)
      },
      // Refetch the entities list to update selectors
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const onSave = (input: CreateEntityInput) => {
    createEntity({ variables: { input } })
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <EntityForm onSave={onSave} loading={loading} error={error} />
    </div>
  )
}

export default NewEntityDialog
