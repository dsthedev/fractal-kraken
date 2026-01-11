import type {
  FindMeasurementUnitById,
  FindMeasurementUnitByIdVariables,
} from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'

export const QUERY = gql`
  query FindMeasurementUnitById($id: Int!) {
    measurementUnit(id: $id) {
      id
      fullName
    }
  }
`

export const Loading = () => (
  <span className="text-muted-foreground">Loading...</span>
)

export const Empty = () => (
  <span className="text-muted-foreground">No unit found</span>
)

export const Failure = ({
  error,
}: CellFailureProps<FindMeasurementUnitByIdVariables>) => (
  <span className="text-destructive" title={error?.message}>
    Error loading unit
  </span>
)

export const Success = ({
  measurementUnit,
}: CellSuccessProps<
  FindMeasurementUnitById,
  FindMeasurementUnitByIdVariables
>) => {
  return measurementUnit.fullName
}
