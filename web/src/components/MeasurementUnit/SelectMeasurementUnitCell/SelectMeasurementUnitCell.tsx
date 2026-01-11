import type {
  FindMeasurementUnits,
  FindMeasurementUnitsVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import MeasurementUnitCombobox from '../MeasurementUnitCombobox'

export const QUERY: TypedDocumentNode<
  FindMeasurementUnits,
  FindMeasurementUnitsVariables
> = gql`
  query FindMeasurementUnits {
    measurementUnits {
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

export const Loading = () => <div>Loading units...</div>

export const Empty = () => <div>No units available</div>

export const Failure = ({
  error,
}: CellFailureProps<FindMeasurementUnitsVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

interface SelectMeasurementUnitCellSuccessProps
  extends CellSuccessProps<
    FindMeasurementUnits,
    FindMeasurementUnitsVariables
  > {
  onSelect: (unitId: number) => void
  selectedId?: number
}

export const Success = ({
  measurementUnits,
  onSelect,
  selectedId,
}: SelectMeasurementUnitCellSuccessProps) => {
  return (
    <MeasurementUnitCombobox
      measurementUnits={measurementUnits}
      value={selectedId}
      onSelect={onSelect}
    />
  )
}
