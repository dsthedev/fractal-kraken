import type { FindServices, FindServicesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Services from 'src/components/Service/Services'

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

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No services yet.{' '}
      <Link to={routes.newService()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindServices>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  services,
}: CellSuccessProps<FindServices, FindServicesVariables>) => {
  return <Services services={services} />
}
