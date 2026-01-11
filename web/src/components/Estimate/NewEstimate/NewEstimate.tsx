import type {
  CreateEstimateMutation,
  CreateEstimateInput,
  CreateEstimateMutationVariables,
  FindEntities,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation, useQuery } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EstimateForm from 'src/components/Estimate/EstimateForm'

const FIND_ENTITIES_QUERY: TypedDocumentNode<FindEntities> = gql`
  query FindEntitiesForNewEstimate {
    entities {
      id
      type
      name
      addressLine1
      addressLine2
      city
      state
      postalCode
    }
  }
`

const CREATE_ESTIMATE_MUTATION: TypedDocumentNode<
  CreateEstimateMutation,
  CreateEstimateMutationVariables
> = gql`
  mutation CreateEstimateMutation($input: CreateEstimateInput!) {
    createEstimate(input: $input) {
      id
    }
  }
`

const NewEstimate = () => {
  const { data: entitiesData } = useQuery(FIND_ENTITIES_QUERY)
  const [createEstimate, { loading, error }] = useMutation(
    CREATE_ESTIMATE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Estimate created')
        navigate(routes.estimates())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateEstimateInput) => {
    createEstimate({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Estimate</h2>
      </header>
      <div className="rw-segment-main">
        <EstimateForm
          onSave={onSave}
          loading={loading}
          error={error}
          entities={entitiesData?.entities}
        />
      </div>
    </div>
  )
}

export default NewEstimate
