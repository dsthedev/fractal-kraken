import type {
  FindMeasurementUnits,
  FindMeasurementUnitsVariables,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import MeasurementUnits from 'src/components/MeasurementUnit/MeasurementUnits'

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
      category
      baseUnit
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No measurementUnits yet.{' '}
      <Link to={routes.newMeasurementUnit()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindMeasurementUnits>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  measurementUnits,
}: CellSuccessProps<FindMeasurementUnits, FindMeasurementUnitsVariables>) => {
  return <MeasurementUnits measurementUnits={measurementUnits} />
}
