import type { FindRates, FindRatesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Rates from 'src/components/Rate/Rates'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindRates, FindRatesVariables> = gql`
  query FindRates {
    rates {
      id
      serviceId
      unitId
      subAmount
      retailAmount
      currency
      authorId
      estimatedMinutesPerUnit
      description
      createdAt
      updatedAt
      service {
        action
        material
        context
      }
      unit {
        fullName
        shortName
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No rates yet.{' '}
      <Link to={routes.newRate()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindRates>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  rates,
}: CellSuccessProps<FindRates, FindRatesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = rates.filter((r) => {
    const searchable = [
      r.service?.action,
      r.service?.material,
      r.service?.context,
      r.unit?.fullName,
      r.estimatedMinutesPerUnit,
      r.description,
      r.subAmount,
      r.retailAmount,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Rates rates={filtered} />
}
