import type {
  EditMeasurementUnitById,
  UpdateMeasurementUnitInput,
  UpdateMeasurementUnitMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import MeasurementUnitForm from 'src/components/MeasurementUnit/MeasurementUnitForm'

export const QUERY: TypedDocumentNode<EditMeasurementUnitById> = gql`
  query EditMeasurementUnitCellById($id: Int!) {
    measurementUnit: measurementUnit(id: $id) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
      description
      createdAt
      updatedAt
    }
  }
`

const UPDATE_MEASUREMENT_UNIT_MUTATION: TypedDocumentNode<
  EditMeasurementUnitById,
  UpdateMeasurementUnitMutationVariables
> = gql`
  mutation UpdateMeasurementUnitCellMutation(
    $id: Int!
    $input: UpdateMeasurementUnitInput!
  ) {
    updateMeasurementUnit(id: $id, input: $input) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
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

export const Success = ({
  measurementUnit,
}: CellSuccessProps<EditMeasurementUnitById>) => {
  const [updateMeasurementUnit, { loading, error }] = useMutation(
    UPDATE_MEASUREMENT_UNIT_MUTATION,
    {
      onCompleted: () => {
        toast.success('MeasurementUnit updated')
        navigate(routes.measurementUnits())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateMeasurementUnitInput,
    id: EditMeasurementUnitById['measurementUnit']['id']
  ) => {
    updateMeasurementUnit({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Measurement Unit
        </h2>
      </header>
      <div className="rw-segment-main">
        <MeasurementUnitForm
          measurementUnit={measurementUnit}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
