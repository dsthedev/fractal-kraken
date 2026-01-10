import type {
  CreateRateMutation,
  CreateRateInput,
  CreateRateMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import RateForm from 'src/components/Rate/RateForm'

const CREATE_RATE_MUTATION: TypedDocumentNode<
  CreateRateMutation,
  CreateRateMutationVariables
> = gql`
  mutation CreateRateMutation($input: CreateRateInput!) {
    createRate(input: $input) {
      id
    }
  }
`

const NewRate = () => {
  const [createRate, { loading, error }] = useMutation(CREATE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate created')
      navigate(routes.rates())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: CreateRateInput) => {
    createRate({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Rate</h2>
      </header>
      <div className="rw-segment-main">
        <RateForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewRate
