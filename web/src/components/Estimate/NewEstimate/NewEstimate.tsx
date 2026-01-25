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
      nickname
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
      onCompleted: (data) => {
        toast.success('Estimate created')
        // Navigate to edit page so user can continue editing
        navigate(routes.editEstimate({ id: data.createEstimate.id }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateEstimateInput) => {
    createEstimate({ variables: { input } })
  }

  const onSaveAndExit = (input: CreateEstimateInput) => {
    createEstimate({
      variables: { input },
      // Override onCompleted to go to estimates list instead
      onCompleted: () => {
        toast.success('Estimate created')
        navigate(routes.estimates())
      },
    })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Estimate</h2>
      </header>
      <div className="rw-segment-main">
        <EstimateForm
          onSave={onSave}
          onSaveAndExit={onSaveAndExit}
          loading={loading}
          error={error}
          entities={entitiesData?.entities}
        />
      </div>
    </div>
  )
}

export default NewEstimate
