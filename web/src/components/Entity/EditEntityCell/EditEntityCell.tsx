import type {
  EditEntityById,
  UpdateEntityInput,
  UpdateEntityMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EntityForm from 'src/components/Entity/EntityForm'

export const QUERY: TypedDocumentNode<EditEntityById> = gql`
  query EditEntityById($id: Int!) {
    entity: entity(id: $id) {
      id
      type
      name
      nickname
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
      createdAt
      updatedAt
    }
  }
`

const UPDATE_ENTITY_MUTATION: TypedDocumentNode<
  EditEntityById,
  UpdateEntityMutationVariables
> = gql`
  mutation UpdateEntityMutation($id: Int!, $input: UpdateEntityInput!) {
    updateEntity(id: $id, input: $input) {
      id
      type
      name
      nickname
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
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ entity }: CellSuccessProps<EditEntityById>) => {
  const [updateEntity, { loading, error }] = useMutation(
    UPDATE_ENTITY_MUTATION,
    {
      onCompleted: () => {
        toast.success('Entity updated')
        navigate(routes.entities())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateEntityInput,
    id: EditEntityById['entity']['id']
  ) => {
    updateEntity({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Entity {entity?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <EntityForm
          entity={entity}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
