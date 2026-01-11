import type { FindEstimates, FindEstimatesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Estimates from 'src/components/Estimate/Estimates'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindEstimates, FindEstimatesVariables> =
  gql`
    query FindEstimates {
      estimates {
        id
        uuid
        title
        status
        installerEntityId
        clientEntityId
        retailerEntityId
        jobAddressLine1
        jobAddressLine2
        jobCity
        jobState
        jobPostalCode
        jobCountry
        subtotal
        taxTotal
        total
        estimatedMinutesTotal
        authorId
        notes
        createdAt
        updatedAt
        entityId
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No estimates yet.{' '}
      <Link to={routes.newEstimate()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindEstimates>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  estimates,
}: CellSuccessProps<FindEstimates, FindEstimatesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = estimates.filter((estimate) => {
    const searchable = [
      estimate.title || '',
      estimate.status || '',
      estimate.jobAddressLine1 || '',
      estimate.jobAddressLine2 || '',
      estimate.jobCity || '',
      estimate.jobState || '',
      estimate.notes || '',
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Estimates estimates={filtered} />
}
