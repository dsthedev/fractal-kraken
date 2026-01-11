import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'

import EntitySelectorCell from '../EntitySelectorCell'

const UPDATE_USER_MUTATION: TypedDocumentNode<
  UpdateUserMutation,
  UpdateUserMutationVariables
> = gql`
  mutation UpdateUserEntityMutation($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      defaultEntityId
      defaultRetailerEntityId
    }
  }
`

type EntitySelectorProps = {
  label: string
  description: string
  fieldName: 'defaultEntityId' | 'defaultRetailerEntityId'
}

const EntitySelector = ({
  label,
  description,
  fieldName,
}: EntitySelectorProps) => {
  const { currentUser, reauthenticate } = useAuth()

  const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('Entity updated successfully')
      // Refresh the current user data
      reauthenticate()
    },
    onError: (error) => {
      toast.error(`Failed to update entity: ${error.message}`)
    },
  })

  const handleSelect = (entityId: number) => {
    if (!currentUser) return

    updateUser({
      variables: {
        id: currentUser.id,
        input: {
          [fieldName]: entityId,
        },
      },
    })
  }

  const currentValue = (currentUser?.[fieldName] as number | null) || null

  return (
    <EntitySelectorCell
      label={label}
      description={description}
      fieldName={fieldName}
      currentValue={currentValue}
      onSelect={handleSelect}
    />
  )
}

export default EntitySelector
