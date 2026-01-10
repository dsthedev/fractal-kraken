import type { FindServiceById, FindServiceByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Service from 'src/components/Service/Service'

export const QUERY: TypedDocumentNode<
  FindServiceById,
  FindServiceByIdVariables
> = gql`
  query FindServiceById($id: Int!) {
    service: service(id: $id) {
      id
      action
      material
      context
      description
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Service not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindServiceByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  service,
}: CellSuccessProps<FindServiceById, FindServiceByIdVariables>) => {
  return <Service service={service} />
}
