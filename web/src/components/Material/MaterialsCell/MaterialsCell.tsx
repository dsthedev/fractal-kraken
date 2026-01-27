import type { FindMaterials, FindMaterialsVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Materials from 'src/components/Material/Materials'
import { Skeleton } from 'src/components/ui/skeleton'
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
        billableItems {
          id
        }
      }
    }
  `

export const Loading = () => (
  <>
    <div className="flex w-full flex-col gap-2 my-10">
      <h2 className="text-xl mx-auto my-4">Loading Materials...</h2>
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </>
)

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
    const searchable = [m.name, m.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Materials materials={filtered} />
}
