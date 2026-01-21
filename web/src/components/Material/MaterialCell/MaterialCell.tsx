import type { FindMaterialById, FindMaterialByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Material from 'src/components/Material/Material'

export const QUERY: TypedDocumentNode<
  FindMaterialById,
  FindMaterialByIdVariables
> = gql`
  query FindMaterialById($id: Int!) {
    material: material(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Material not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindMaterialByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  material,
}: CellSuccessProps<FindMaterialById, FindMaterialByIdVariables>) => {
  return <Material material={material} />
}
