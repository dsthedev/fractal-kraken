import type { FindRates, FindRatesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Rates from 'src/components/Rate/Rates'

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
      description
      createdAt
      updatedAt
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
  return <Rates rates={rates} />
}
