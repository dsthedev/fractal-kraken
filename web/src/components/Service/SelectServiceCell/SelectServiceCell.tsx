import type { FindServices, FindServicesVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

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
    <div className="space-y-2">
      <label htmlFor="service-select" className="block text-sm font-medium">
        Service
      </label>
      <select
        id="service-select"
        className="rw-input"
        value={selectedId ? String(selectedId) : ''}
        onChange={(e) => {
          if (e.target.value) {
            onSelect(parseInt(e.target.value, 10))
          }
        }}
      >
        <option value="">Select a service...</option>
        {services.map((service) => (
          <option key={service.id} value={String(service.id)}>
            {service.action} {service.material}
            {service.context ? ` (${service.context})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
