import type {
  EditRateById,
  UpdateRateInput,
  UpdateRateMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import RateFormWrapper from 'src/components/Rate/RateFormWrapper'

export const QUERY: TypedDocumentNode<EditRateById> = gql`
  query EditRateById($id: Int!) {
    rate: rate(id: $id) {
      id
      serviceId
      unitId
      subAmount
      retailAmount
      estimatedMinutesPerUnit
      currency
      authorId
      description
      createdAt
      updatedAt
      service {
        action
        material
        context
      }
      unit {
        fullName
      }
    }
  }
`

const UPDATE_RATE_MUTATION: TypedDocumentNode<
  EditRateById,
  UpdateRateMutationVariables
> = gql`
  mutation UpdateRateMutation($id: Int!, $input: UpdateRateInput!) {
    updateRate(id: $id, input: $input) {
      id
      serviceId
      unitId
      subAmount
      retailAmount
      estimatedMinutesPerUnit
      currency
      authorId
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

export const Success = ({ rate }: CellSuccessProps<EditRateById>) => {
  const [updateRate, { loading, error }] = useMutation(UPDATE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate updated')
      navigate(routes.rates())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: UpdateRateInput, id: EditRateById['rate']['id']) => {
    updateRate({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          {rate?.service.action} {rate?.service.material}{' '}
          {rate?.service.context}{' '}
        </h2>
      </header>
      <div className="rw-segment-main">
        <RateFormWrapper
          rate={rate}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
