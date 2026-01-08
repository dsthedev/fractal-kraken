import type { FindAudits, FindAuditsVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Audits from 'src/components/Audit/Audits'

export const QUERY: TypedDocumentNode<FindAudits, FindAuditsVariables> = gql`
  query FindAudits {
    audits {
      id
      createdAt
      updatedAt
      userId
      log
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No audits yet.{' '}
      <Link to={routes.newAudit()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindAudits>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  audits,
}: CellSuccessProps<FindAudits, FindAuditsVariables>) => {
  return <Audits audits={audits} />
}
