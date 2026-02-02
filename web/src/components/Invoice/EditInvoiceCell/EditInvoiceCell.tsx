import type {
  EditInvoiceByUuid,
  UpdateInvoiceInput,
  UpdateInvoiceMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import InvoiceForm from 'src/components/Invoice/InvoiceForm'

export const QUERY: TypedDocumentNode<EditInvoiceByUuid> = gql`
  query EditInvoiceByUuid($uuid: String!) {
    invoice: invoice(uuid: $uuid) {
      uuid
      createdAt
      updatedAt
      authorId
      invoiceNumber
      status
      payStatus
      jobStartedAt
      jobFinishedAt
      dueAt
      paidAt
      payorEntityId
      payeeEntityId
      sourceEstimateId
      sourceInstallerEntityId
      sourceClientEntityId
      sourceRetailerEntityId
      payeeAddressLine1
      payeeAddressLine2
      payeeCity
      payeeState
      payeePostalCode
      payeeCountry
      payorAddressLine1
      payorAddressLine2
      payorCity
      payorState
      payorPostalCode
      payorCountry
      jobAddressLine1
      jobAddressLine2
      jobCity
      jobState
      jobPostalCode
      jobCountry
      subtotal
      taxTotal
      total
      notes
      entityId
    }
  }
`

const UPDATE_INVOICE_MUTATION: TypedDocumentNode<
  EditInvoiceById,
  UpdateInvoiceMutationVariables
> = gql`
  mutation UpdateInvoiceMutation($uuid: String!, $input: UpdateInvoiceInput!) {
    updateInvoice(uuid: $uuid, input: $input) {
      uuid
      createdAt
      updatedAt
      authorId
      invoiceNumber
      status
      payStatus
      jobStartedAt
      jobFinishedAt
      dueAt
      paidAt
      payorEntityId
      payeeEntityId
      sourceEstimateId
      sourceInstallerEntityId
      sourceClientEntityId
      sourceRetailerEntityId
      payeeAddressLine1
      payeeAddressLine2
      payeeCity
      payeeState
      payeePostalCode
      payeeCountry
      payorAddressLine1
      payorAddressLine2
      payorCity
      payorState
      payorPostalCode
      payorCountry
      jobAddressLine1
      jobAddressLine2
      jobCity
      jobState
      jobPostalCode
      jobCountry
      subtotal
      taxTotal
      total
      notes
      entityId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ invoice }: CellSuccessProps<EditInvoiceByUuid>) => {
  const [updateInvoice, { loading, error }] = useMutation(
    UPDATE_INVOICE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Invoice updated')
        navigate(routes.invoices())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateInvoiceInput,
    id: EditInvoiceByUuid['invoice']['id']
  ) => {
    updateInvoice({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Invoice {invoice?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <InvoiceForm
          invoice={invoice}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
