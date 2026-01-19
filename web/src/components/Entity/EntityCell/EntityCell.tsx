import type { FindEntityById, FindEntityByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Entity from 'src/components/Entity/Entity'

export const QUERY: TypedDocumentNode<FindEntityById, FindEntityByIdVariables> =
  gql`
    query FindEntityById($id: Int!) {
      entity: entity(id: $id) {
        id
        type
        name
        nickname
        contactName
        email
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        notes
        createdAt
        updatedAt
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Entity not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindEntityByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  entity,
}: CellSuccessProps<FindEntityById, FindEntityByIdVariables>) => {
  return <Entity entity={entity} />
}
