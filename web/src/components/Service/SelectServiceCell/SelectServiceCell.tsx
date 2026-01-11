import type { FindServices, FindServicesVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import ServiceCombobox from '../ServiceCombobox'

export const QUERY: TypedDocumentNode<FindServices, FindServicesVariables> =
  gql`
    query FindServices {
      services {
        id
        action
        material
        context
        description
        createdAt
        updatedAt
      }
    }
  `

export const Loading = () => <div>Loading services...</div>

export const Empty = () => <div>No services available</div>

export const Failure = ({ error }: CellFailureProps<FindServices>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

interface SelectServiceCellSuccessProps
  extends CellSuccessProps<FindServices, FindServicesVariables> {
  onSelect: (serviceId: number) => void
  selectedId?: number
}

export const Success = ({
  services,
  onSelect,
  selectedId,
}: SelectServiceCellSuccessProps) => {
  return (
    <ServiceCombobox
      services={services}
      value={selectedId}
      onSelect={onSelect}
    />
  )
}
