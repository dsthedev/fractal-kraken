import type { FindMaterials, FindMaterialsVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import MaterialCombobox from '../MaterialCombobox'

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

export const Loading = () => <div>Loading materials...</div>

export const Empty = () => <div>No materials available</div>

export const Failure = ({ error }: CellFailureProps<FindMaterials>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

interface SelectMaterialCellSuccessProps
  extends CellSuccessProps<FindMaterials, FindMaterialsVariables> {
  onSelect: (materialId: number) => void
  selectedId?: number
}

export const Success = ({
  materials,
  onSelect,
  selectedId,
}: SelectMaterialCellSuccessProps) => {
  return (
    <MaterialCombobox
      materials={materials}
      value={selectedId}
      onSelect={onSelect}
    />
  )
}
