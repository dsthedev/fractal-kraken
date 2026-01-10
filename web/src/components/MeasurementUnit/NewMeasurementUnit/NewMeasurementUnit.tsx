import type {
  CreateMeasurementUnitMutation,
  CreateMeasurementUnitInput,
  CreateMeasurementUnitMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import MeasurementUnitForm from 'src/components/MeasurementUnit/MeasurementUnitForm'

const CREATE_MEASUREMENT_UNIT_MUTATION: TypedDocumentNode<
  CreateMeasurementUnitMutation,
  CreateMeasurementUnitMutationVariables
> = gql`
  mutation CreateMeasurementUnitMutation($input: CreateMeasurementUnitInput!) {
    createMeasurementUnit(input: $input) {
      id
    }
  }
`

const NewMeasurementUnit = () => {
  const [createMeasurementUnit, { loading, error }] = useMutation(
    CREATE_MEASUREMENT_UNIT_MUTATION,
    {
      onCompleted: () => {
        toast.success('MeasurementUnit created')
        navigate(routes.measurementUnits())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateMeasurementUnitInput) => {
    createMeasurementUnit({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New MeasurementUnit</h2>
      </header>
      <div className="rw-segment-main">
        <MeasurementUnitForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewMeasurementUnit
