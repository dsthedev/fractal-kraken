import type { FindActionById, FindActionByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Action from 'src/components/Action/Action'

export const QUERY: TypedDocumentNode<FindActionById, FindActionByIdVariables> =
  gql`
    query FindActionById($id: Int!) {
      action: action(id: $id) {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Action not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindActionByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  action,
}: CellSuccessProps<FindActionById, FindActionByIdVariables>) => {
  return <Action action={action} />
}
