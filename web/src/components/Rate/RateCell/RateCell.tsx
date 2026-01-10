import type { FindRateById, FindRateByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Rate from 'src/components/Rate/Rate'

export const QUERY: TypedDocumentNode<FindRateById, FindRateByIdVariables> =
  gql`
    query FindRateById($id: Int!) {
      rate: rate(id: $id) {
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

export const Empty = () => <div>Rate not found</div>

export const Failure = ({ error }: CellFailureProps<FindRateByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  rate,
}: CellSuccessProps<FindRateById, FindRateByIdVariables>) => {
  return <Rate rate={rate} />
}
