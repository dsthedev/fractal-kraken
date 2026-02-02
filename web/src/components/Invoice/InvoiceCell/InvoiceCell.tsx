import type {
  FindInvoiceByUuid,
  FindInvoiceByUuidVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Invoice from 'src/components/Invoice/Invoice'

export const QUERY: TypedDocumentNode<
  FindInvoiceByUuid,
  FindInvoiceByUuidVariables
> = gql`
  query FindInvoiceByUuid($uuid: String!) {
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

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Invoice not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindInvoiceByUuidVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  invoice,
}: CellSuccessProps<FindInvoiceByUuid, FindInvoiceByUuidVariables>) => {
  return <Invoice invoice={invoice} />
}
