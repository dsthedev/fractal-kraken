import type {
  CreateAuditMutation,
  CreateAuditInput,
  CreateAuditMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import AuditForm from 'src/components/Audit/AuditForm'

const CREATE_AUDIT_MUTATION: TypedDocumentNode<
  CreateAuditMutation,
  CreateAuditMutationVariables
> = gql`
  mutation CreateAuditMutation($input: CreateAuditInput!) {
    createAudit(input: $input) {
      id
    }
  }
`

const NewAudit = () => {
  const [createAudit, { loading, error }] = useMutation(CREATE_AUDIT_MUTATION, {
    onCompleted: () => {
      toast.success('Audit created')
      navigate(routes.audits())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: CreateAuditInput) => {
    createAudit({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Audit</h2>
      </header>
      <div className="rw-segment-main">
        <AuditForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewAudit
