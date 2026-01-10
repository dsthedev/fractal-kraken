import type {
  EditServiceById,
  UpdateServiceInput,
  UpdateServiceMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ServiceForm from 'src/components/Service/ServiceForm'

export const QUERY: TypedDocumentNode<EditServiceById> = gql`
  query EditServiceById($id: Int!) {
    service: service(id: $id) {
      id
      action
      material
      context
      description
      createdAt
      updatedAt
    }
  }
`

const UPDATE_SERVICE_MUTATION: TypedDocumentNode<
  EditServiceById,
  UpdateServiceMutationVariables
> = gql`
  mutation UpdateServiceMutation($id: Int!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      action
      material
      context
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

export const Success = ({ service }: CellSuccessProps<EditServiceById>) => {
  const [updateService, { loading, error }] = useMutation(
    UPDATE_SERVICE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Service updated')
        navigate(routes.services())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateServiceInput,
    id: EditServiceById['service']['id']
  ) => {
    updateService({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Service</h2>
      </header>
      <div className="rw-segment-main">
        <ServiceForm
          service={service}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
