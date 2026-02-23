import type { FindTags, FindTagsVariables } from 'types/graphql'
import { ta } from 'zod/v4/locales'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Tags from 'src/components/Tag/Tags'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindTags, FindTagsVariables> = gql`
  query FindTags {
    tags {
      id
      name
      description
      authorId
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No tags yet.{' '}
      <Link to={routes.newTag()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindTags>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  tags,
}: CellSuccessProps<FindTags, FindTagsVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = tags.filter((t) => {
    const searchable = [t.name, t.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Tags tags={filtered} />
}
