import type { FindEntities, FindEntitiesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Entities from 'src/components/Entity/Entities'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindEntities, FindEntitiesVariables> =
  gql`
    query FindEntities {
      entities {
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

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No entities yet.{' '}
      <Link to={routes.newEntity()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindEntities>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  entities,
}: CellSuccessProps<FindEntities, FindEntitiesVariables>) => {
  const { searchQuery } = useSearch()

  // Filter entities based on search query
  const filteredEntities =
    entities?.filter((entity) => {
      const query = searchQuery.toLowerCase()
      return (
        entity.name?.toLowerCase().includes(query) ||
        entity.contactName?.toLowerCase().includes(query) ||
        entity.email?.toLowerCase().includes(query) ||
        entity.phone?.toLowerCase().includes(query) ||
        entity.city?.toLowerCase().includes(query) ||
        entity.state?.toLowerCase().includes(query)
      )
    }) || []

  return <Entities entities={filteredEntities} />
}
