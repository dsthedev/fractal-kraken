import type { FindActions, FindActionsVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import ActionCombobox from '../ActionCombobox'

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

export const Loading = () => <div>Loading actions...</div>

export const Empty = () => <div>No actions available</div>

export const Failure = ({ error }: CellFailureProps<FindActions>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

interface SelectActionCellSuccessProps
  extends CellSuccessProps<FindActions, FindActionsVariables> {
  onSelect: (actionId: number) => void
  selectedId?: number
}

export const Success = ({
  actions,
  onSelect,
  selectedId,
}: SelectActionCellSuccessProps) => {
  return (
    <ActionCombobox actions={actions} value={selectedId} onSelect={onSelect} />
  )
}
