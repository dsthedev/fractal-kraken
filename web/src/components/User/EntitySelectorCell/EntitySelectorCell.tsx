import type {
  FindEntitiesForSelectorQuery,
  FindEntitiesForSelectorQueryVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import EntityCombobox from '../EntityCombobox'

export const QUERY: TypedDocumentNode<
  FindEntitiesForSelectorQuery,
  FindEntitiesForSelectorQueryVariables
> = gql`
  query FindEntitiesForSelectorQuery {
    entities {
      id
      name
      type
      contactName
      email
      phone
      city
      state
    }
  }
`

export const Loading = () => (
  <div className="text-sm text-muted-foreground">Loading entities...</div>
)

export const Empty = () => (
  <div className="text-sm text-muted-foreground">
    No entities found. Create one first.
  </div>
)

export const Failure = ({
  error,
}: CellFailureProps<FindEntitiesForSelectorQuery>) => (
  <div className="text-sm text-destructive">Error: {error?.message}</div>
)

export const Success = ({
  entities,
  label,
  description,
  fieldName: _fieldName,
  currentValue,
  onSelect,
}: CellSuccessProps<
  FindEntitiesForSelectorQuery,
  FindEntitiesForSelectorQueryVariables
> & {
  label: string
  description: string
  fieldName: string
  currentValue: number | null
  onSelect: (entityId: number) => void
}) => {
  return (
    <div className="space-y-2">
      <EntityCombobox
        entities={entities}
        value={currentValue}
        onSelect={onSelect}
        label={label}
        placeholder="Select an entity..."
        searchPlaceholder="Search entities..."
        emptyText="No entities found."
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
