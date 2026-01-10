import type {
  FindMeasurementUnitById,
  FindMeasurementUnitByIdVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import MeasurementUnit from 'src/components/MeasurementUnit/MeasurementUnit'

export const QUERY: TypedDocumentNode<
  FindMeasurementUnitById,
  FindMeasurementUnitByIdVariables
> = gql`
  query FindMeasurementUnitById($id: Int!) {
    measurementUnit: measurementUnit(id: $id) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
      dimension
      description
      conversionFactor
      baseUnit
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>MeasurementUnit not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindMeasurementUnitByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  measurementUnit,
}: CellSuccessProps<
  FindMeasurementUnitById,
  FindMeasurementUnitByIdVariables
>) => {
  return <MeasurementUnit measurementUnit={measurementUnit} />
}
