import type {
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables,
  FindInvoiceByUuid,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { formatEnum, timeTag } from 'src/lib/formatters.js'

const DELETE_INVOICE_MUTATION: TypedDocumentNode<
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables
> = gql`
  mutation DeleteInvoiceMutation($uuid: String!) {
    deleteInvoice(uuid: $uuid) {
      uuid
    }
  }
`

interface Props {
  invoice: NonNullable<FindInvoiceByUuid['invoice']>
}

const Invoice = ({ invoice }: Props) => {
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    onCompleted: () => {
      toast.success('Invoice deleted')
      navigate(routes.invoices())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (uuid: DeleteInvoiceMutationVariables['uuid']) => {
    if (confirm('Are you sure you want to delete invoice ' + uuid + '?')) {
      deleteInvoice({ variables: { uuid } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Invoice {invoice.uuid} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Uuid</th>
              <td>{invoice.uuid}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(invoice.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(invoice.updatedAt)}</td>
            </tr>
            <tr>
              <th>Author id</th>
              <td>{invoice.authorId}</td>
            </tr>
            <tr>
              <th>Invoice number</th>
              <td>{invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{formatEnum(invoice.status)}</td>
            </tr>
            <tr>
              <th>Pay status</th>
              <td>{formatEnum(invoice.payStatus)}</td>
            </tr>
            <tr>
              <th>Job started at</th>
              <td>{timeTag(invoice.jobStartedAt)}</td>
            </tr>
            <tr>
              <th>Job finished at</th>
              <td>{timeTag(invoice.jobFinishedAt)}</td>
            </tr>
            <tr>
              <th>Due at</th>
              <td>{timeTag(invoice.dueAt)}</td>
            </tr>
            <tr>
              <th>Paid at</th>
              <td>{timeTag(invoice.paidAt)}</td>
            </tr>
            <tr>
              <th>Payor entity id</th>
              <td>{invoice.payorEntityId}</td>
            </tr>
            <tr>
              <th>Payee entity id</th>
              <td>{invoice.payeeEntityId}</td>
            </tr>
            <tr>
              <th>Source estimate id</th>
              <td>{invoice.sourceEstimateId}</td>
            </tr>
            <tr>
              <th>Source installer entity id</th>
              <td>{invoice.sourceInstallerEntityId}</td>
            </tr>
            <tr>
              <th>Source client entity id</th>
              <td>{invoice.sourceClientEntityId}</td>
            </tr>
            <tr>
              <th>Source retailer entity id</th>
              <td>{invoice.sourceRetailerEntityId}</td>
            </tr>
            <tr>
              <th>Payee address line1</th>
              <td>{invoice.payeeAddressLine1}</td>
            </tr>
            <tr>
              <th>Payee address line2</th>
              <td>{invoice.payeeAddressLine2}</td>
            </tr>
            <tr>
              <th>Payee city</th>
              <td>{invoice.payeeCity}</td>
            </tr>
            <tr>
              <th>Payee state</th>
              <td>{invoice.payeeState}</td>
            </tr>
            <tr>
              <th>Payee postal code</th>
              <td>{invoice.payeePostalCode}</td>
            </tr>
            <tr>
              <th>Payee country</th>
              <td>{invoice.payeeCountry}</td>
            </tr>
            <tr>
              <th>Payor address line1</th>
              <td>{invoice.payorAddressLine1}</td>
            </tr>
            <tr>
              <th>Payor address line2</th>
              <td>{invoice.payorAddressLine2}</td>
            </tr>
            <tr>
              <th>Payor city</th>
              <td>{invoice.payorCity}</td>
            </tr>
            <tr>
              <th>Payor state</th>
              <td>{invoice.payorState}</td>
            </tr>
            <tr>
              <th>Payor postal code</th>
              <td>{invoice.payorPostalCode}</td>
            </tr>
            <tr>
              <th>Payor country</th>
              <td>{invoice.payorCountry}</td>
            </tr>
            <tr>
              <th>Job address line1</th>
              <td>{invoice.jobAddressLine1}</td>
            </tr>
            <tr>
              <th>Job address line2</th>
              <td>{invoice.jobAddressLine2}</td>
            </tr>
            <tr>
              <th>Job city</th>
              <td>{invoice.jobCity}</td>
            </tr>
            <tr>
              <th>Job state</th>
              <td>{invoice.jobState}</td>
            </tr>
            <tr>
              <th>Job postal code</th>
              <td>{invoice.jobPostalCode}</td>
            </tr>
            <tr>
              <th>Job country</th>
              <td>{invoice.jobCountry}</td>
            </tr>
            <tr>
              <th>Subtotal</th>
              <td>{invoice.subtotal}</td>
            </tr>
            <tr>
              <th>Tax total</th>
              <td>{invoice.taxTotal}</td>
            </tr>
            <tr>
              <th>Total</th>
              <td>{invoice.total}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{invoice.notes}</td>
            </tr>
            <tr>
              <th>Entity id</th>
              <td>{invoice.entityId}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editInvoice({ uuid: invoice.uuid })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(invoice.uuid)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Invoice
