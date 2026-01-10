import type {
  CreateServiceMutation,
  CreateServiceInput,
  CreateServiceMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ServiceForm from 'src/components/Service/ServiceForm'

const CREATE_SERVICE_MUTATION: TypedDocumentNode<
  CreateServiceMutation,
  CreateServiceMutationVariables
> = gql`
  mutation CreateServiceMutation($input: CreateServiceInput!) {
    createService(input: $input) {
      id
    }
  }
`

const NewService = () => {
  const [createService, { loading, error }] = useMutation(
    CREATE_SERVICE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Service created')
        navigate(routes.services())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateServiceInput) => {
    createService({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Service</h2>
      </header>
      <div className="rw-segment-main">
        <ServiceForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewService
