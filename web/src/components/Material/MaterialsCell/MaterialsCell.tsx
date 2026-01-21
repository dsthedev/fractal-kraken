import type { FindMaterials, FindMaterialsVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Materials from 'src/components/Material/Materials'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindMaterials, FindMaterialsVariables> =
  gql`
    query FindMaterials {
      materials {
        id
        name
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
      No materials yet.{' '}
      <Link to={routes.newMaterial()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindMaterials>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  materials,
}: CellSuccessProps<FindMaterials, FindMaterialsVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = materials.filter((m) => {
    const searchable = [m.name, m.description || ''].join(' ').toLowerCase()
    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Materials materials={filtered} />
}
