import type {
  EditMaterialById,
  UpdateMaterialInput,
  UpdateMaterialMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import MaterialForm from 'src/components/Material/MaterialForm'

export const QUERY: TypedDocumentNode<EditMaterialById> = gql`
  query EditMaterialById($id: Int!) {
    material: material(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`

const UPDATE_MATERIAL_MUTATION: TypedDocumentNode<
  EditMaterialById,
  UpdateMaterialMutationVariables
> = gql`
  mutation UpdateMaterialMutation($id: Int!, $input: UpdateMaterialInput!) {
    updateMaterial(id: $id, input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ material }: CellSuccessProps<EditMaterialById>) => {
  const [updateMaterial, { loading, error }] = useMutation(
    UPDATE_MATERIAL_MUTATION,
    {
      onCompleted: () => {
        toast.success('Material updated')
        navigate(routes.materials())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateMaterialInput,
    id: EditMaterialById['material']['id']
  ) => {
    updateMaterial({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Material {material?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <MaterialForm
          material={material}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
