import type {
  EditEstimateById,
  UpdateEstimateInput,
  UpdateEstimateMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EstimateForm from 'src/components/Estimate/EstimateForm'

export const QUERY: TypedDocumentNode<EditEstimateById> = gql`
  query EditEstimateById($id: Int!) {
    estimate: estimate(id: $id) {
      id
      uuid
      title
      status
      installerEntityId
      clientEntityId
      retailerEntityId
      jobAddressLine1
      jobAddressLine2
      jobCity
      jobState
      jobPostalCode
      jobCountry
      subtotal
      taxTotal
      total
      estimatedMinutesTotal
      authorId
      notes
      createdAt
      updatedAt
      entityId
    }
  }
`

const UPDATE_ESTIMATE_MUTATION: TypedDocumentNode<
  EditEstimateById,
  UpdateEstimateMutationVariables
> = gql`
  mutation UpdateEstimateMutation($id: Int!, $input: UpdateEstimateInput!) {
    updateEstimate(id: $id, input: $input) {
      id
      uuid
      title
      status
      installerEntityId
      clientEntityId
      retailerEntityId
      jobAddressLine1
      jobAddressLine2
      jobCity
      jobState
      jobPostalCode
      jobCountry
      subtotal
      taxTotal
      total
      estimatedMinutesTotal
      authorId
      notes
      createdAt
      updatedAt
      entityId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ estimate }: CellSuccessProps<EditEstimateById>) => {
  const [updateEstimate, { loading, error }] = useMutation(
    UPDATE_ESTIMATE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Estimate updated')
        navigate(routes.estimates())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateEstimateInput,
    id: EditEstimateById['estimate']['id']
  ) => {
    updateEstimate({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Estimate {estimate?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <EstimateForm
          estimate={estimate}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
