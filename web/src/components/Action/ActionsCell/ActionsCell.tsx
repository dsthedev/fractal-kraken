import type { FindActions, FindActionsVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Actions from 'src/components/Action/Actions'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindActions, FindActionsVariables> = gql`
  query FindActions {
    actions {
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
      No actions yet.{' '}
      <Link to={routes.newAction()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindActions>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  actions,
}: CellSuccessProps<FindActions, FindActionsVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = actions.filter((a) => {
    const searchable = [a.name, a.description || ''].join(' ').toLowerCase()
    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Actions actions={filtered} />
}
