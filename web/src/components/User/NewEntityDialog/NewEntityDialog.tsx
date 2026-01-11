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
      type
      name
      contactName
      email
      phone
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      notes
    }
  }
`

type NewEntityDialogProps = {
  onClose: () => void
  onCreated?: (entity: CreateEntityMutation['createEntity']) => void
  defaultType?: CreateEntityInput['type']
}

const NewEntityDialog = ({ onClose, onCreated, defaultType }: NewEntityDialogProps) => {
  const [createEntity, { loading, error }] = useMutation(
    CREATE_ENTITY_MUTATION,
    {
      onCompleted: (result) => {
        if (result?.createEntity) {
          onCreated?.(result.createEntity)
        }
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
      <EntityForm
        onSave={onSave}
        loading={loading}
        error={error}
        initialValues={{ type: defaultType }}
      />
    </div>
  )
}

export default NewEntityDialog
