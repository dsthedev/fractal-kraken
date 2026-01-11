import type {
  FindEntitiesForSelectorQuery,
  FindEntitiesForSelectorQueryVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

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
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <select
        value={currentValue || ''}
        onChange={(e) => onSelect(parseInt(e.target.value))}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select an entity...</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.name} {entity.contactName ? `(${entity.contactName})` : ''}
            {entity.city && entity.state
              ? ` - ${entity.city}, ${entity.state}`
              : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
