import type { FindTags, FindTagsVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useQuery } from '@cedarjs/web'

import QuickAddTag from 'src/components/Tag/QuickAddTag/QuickAddTag'
import Tags from 'src/components/Tag/Tags'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
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
  const { refetch } = useQuery(QUERY)

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl">No Tags Yet</h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Tags are small labels you can attach to estimates, invoices, and
              services to organize and filter your work. Use them to mark
              priority, location, client type, or any custom grouping.
            </p>

            <div className="rounded-md border p-3 text-left text-sm">
              <p className="font-medium">Quick ways to add tags</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <strong>Quick add:</strong> Use the field below to create a
                  tag instantly.
                </li>
                <li>
                  <strong>Full form:</strong> Open the detailed form to add
                  description and other metadata.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <QuickAddTag onAdded={refetch} />
          </div>

          <hr className="my-2" />

          <Button asChild variant="lime" size="lg" className="w-full">
            <Link to={routes.newTag()}>Create Tag (full form)</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindTags>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = (
  props: CellSuccessProps<FindTags, FindTagsVariables>
) => {
  const { searchQuery } = useSearch()

  // Use `useQuery` here to obtain a `refetch` function we can pass to the
  // `Tags` component so children (like `QuickAddTag`) can trigger a refresh.
  const { data, refetch } = useQuery(QUERY)

  const tags = data?.tags ?? props.tags

  const filtered = tags.filter((t) => {
    const searchable = [t.name, t.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return (
    <>
      <Tags tags={filtered} refetch={refetch} />
      <hr className="my-4 mx-auto max-w-md" />
      <div className="flex justify-center">
        <QuickAddTag onAdded={refetch} />
      </div>
    </>
  )
}
