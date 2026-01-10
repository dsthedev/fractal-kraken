// ============================================================================
// EXAMPLE: How to use the Search Context in a child component
// ============================================================================
// This example shows how any component rendered inside AdminScaffoldLayout
// can access the search query and filter data accordingly

/*
// In your data component (e.g., MeasurementUnitsCell.tsx):

import { useSearch } from 'src/contexts/SearchContext'

const MeasurementUnitsCell = () => {
  const { searchQuery } = useSearch()
  const { data: units, loading, error } = useQuery(MEASUREMENT_UNITS_QUERY)

  // Filter data based on search query
  const filteredUnits = units?.filter((unit) =>
    unit.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div>
      {filteredUnits.map((unit) => (
        <div key={unit.id}>{unit.fullName}</div>
      ))}
    </div>
  )
}

// DATA FLOW:
// 1. User types in SearchInput → updates searchQuery in context
// 2. SearchContext.Provider notifies all subscribers (including this component)
// 3. Component re-renders with new filteredUnits based on searchQuery
// 4. UI updates instantly with filtered results
*/
