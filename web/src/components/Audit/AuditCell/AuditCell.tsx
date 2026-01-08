import type { FindAuditById, FindAuditByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Audit from 'src/components/Audit/Audit'

export const QUERY: TypedDocumentNode<FindAuditById, FindAuditByIdVariables> =
  gql`
    query FindAuditById($id: String!) {
      audit: audit(id: $id) {
        id
        createdAt
        updatedAt
        userId
        log
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Audit not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindAuditByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  audit,
}: CellSuccessProps<FindAuditById, FindAuditByIdVariables>) => {
  return <Audit audit={audit} />
}
