import type { FindServiceById, FindServiceByIdVariables } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'

export const QUERY = gql`
  query FindServiceById($id: Int!) {
    service(id: $id) {
      id
      action
      material
    }
  }
`

export const Loading = () => (
  <span className="text-muted-foreground">Loading...</span>
)

export const Empty = () => (
  <span className="text-muted-foreground">No service found</span>
)

export const Failure = ({
  error,
}: CellFailureProps<FindServiceByIdVariables>) => (
  <span className="text-destructive" title={error?.message}>
    Error loading service
  </span>
)

export const Success = ({
  service,
}: CellSuccessProps<FindServiceById, FindServiceByIdVariables>) => {
  return service.action + ' ' + service.material
}
