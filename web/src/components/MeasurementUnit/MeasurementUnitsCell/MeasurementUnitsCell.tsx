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

import { useSearch } from 'src/contexts/SearchContext'
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
  // ========================================================================
  // SEARCH FILTERING
  // ========================================================================
  // Get the search query from the AdminScaffoldLayout context
  const { searchQuery } = useSearch()

  // Filter units based on concatenated search across multiple fields
  // This allows users to search by any combination of unit attributes
  const filteredUnits = measurementUnits.filter((unit) => {
    // Concatenate all searchable fields into a single string
    // Include: fullName, pluralName, shortName, symbol, description,
    //          baseUnit, dimension, and category
    const searchableText = [
      unit.fullName,
      unit.pluralName,
      unit.shortName || '',
      unit.symbol || '',
      unit.description || '',
      unit.baseUnit || '',
      unit.dimension || '',
      unit.category || '',
    ]
      .join(' ')
      .toLowerCase()

    // Return true if any part of the searchable text includes the query
    return searchableText.includes(searchQuery.toLowerCase())
  })

  return <MeasurementUnits measurementUnits={filteredUnits} />
}
