import type {
  FindMeasurementUnits,
  FindMeasurementUnitsVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

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
    <div className="space-y-2">
      <label htmlFor="unit-select" className="block text-sm font-medium">
        Measurement Unit
      </label>
      <select
        id="unit-select"
        className="rw-input"
        value={selectedId ? String(selectedId) : ''}
        onChange={(e) => {
          if (e.target.value) {
            onSelect(parseInt(e.target.value, 10))
          }
        }}
      >
        <option value="">Select a unit...</option>
        {measurementUnits.map((unit) => (
          <option key={unit.id} value={String(unit.id)}>
            {unit.fullName} {unit.symbol ? `(${unit.symbol})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
