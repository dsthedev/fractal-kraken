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
      sourceEstimate {
        id
        title
      }
      sourceInstallerEntityId
      sourceInstallerEntity {
        id
        name
        nickname
        email
        phone
      }
      sourceClientEntityId
      sourceClientEntity {
        id
        name
        nickname
        email
        phone
      }
      sourceRetailerEntityId
      sourceRetailerEntity {
        id
        name
        nickname
        email
        phone
      }
      payeeName
      payeeAddressLine1
      payeeAddressLine2
      payeeCity
      payeeState
      payeePostalCode
      payeeCountry
      payorName
      payorAddressLine1
      payorAddressLine2
      payorCity
      payorState
      payorPostalCode
      payorCountry
      jobName
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
      billableItems {
        id
        actionId
        materialId
        unitId
        unitPrice
        pricingType
        quantity
        subtotal
        estimatedMinutesPerUnit
        notes
        sortOrder
        invoiceUuid
        authorId
        createdAt
        updatedAt
        author {
          id
          name
          email
        }
        action {
          id
          name
        }
        material {
          id
          name
        }
        unit {
          id
          shortName
          fullName
        }
      }
    }
  }
`

const UPDATE_INVOICE_MUTATION: TypedDocumentNode<
  { updateInvoice: EditInvoiceByUuid['invoice'] },
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
    uuid: EditInvoiceByUuid['invoice']['uuid']
  ) => {
    updateInvoice({ variables: { uuid, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Invoice {invoice?.invoiceNumber}
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
