import type {
  DeleteInvoiceMutation,
  DeleteInvoiceMutationVariables,
  FindInvoices,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Invoice/InvoicesCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters.js'

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

const InvoicesList = ({ invoices }: FindInvoices) => {
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    onCompleted: () => {
      toast.success('Invoice deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (uuid: DeleteInvoiceMutationVariables['uuid']) => {
    if (confirm('Are you sure you want to delete invoice ' + uuid + '?')) {
      deleteInvoice({ variables: { uuid } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Uuid</th>
            <th>Created at</th>
            <th>Updated at</th>
            <th>Author id</th>
            <th>Invoice number</th>
            <th>Status</th>
            <th>Pay status</th>
            <th>Job started at</th>
            <th>Job finished at</th>
            <th>Due at</th>
            <th>Paid at</th>
            <th>Payor entity id</th>
            <th>Payee entity id</th>
            <th>Source estimate id</th>
            <th>Source installer entity id</th>
            <th>Source client entity id</th>
            <th>Source retailer entity id</th>
            <th>Payee address line1</th>
            <th>Payee address line2</th>
            <th>Payee city</th>
            <th>Payee state</th>
            <th>Payee postal code</th>
            <th>Payee country</th>
            <th>Payor address line1</th>
            <th>Payor address line2</th>
            <th>Payor city</th>
            <th>Payor state</th>
            <th>Payor postal code</th>
            <th>Payor country</th>
            <th>Job address line1</th>
            <th>Job address line2</th>
            <th>Job city</th>
            <th>Job state</th>
            <th>Job postal code</th>
            <th>Job country</th>
            <th>Subtotal</th>
            <th>Tax total</th>
            <th>Total</th>
            <th>Notes</th>
            <th>Entity id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.uuid}>
              <td>{truncate(invoice.uuid)}</td>
              <td>{timeTag(invoice.createdAt)}</td>
              <td>{timeTag(invoice.updatedAt)}</td>
              <td>{truncate(invoice.authorId)}</td>
              <td>{truncate(invoice.invoiceNumber)}</td>
              <td>{formatEnum(invoice.status)}</td>
              <td>{formatEnum(invoice.payStatus)}</td>
              <td>{timeTag(invoice.jobStartedAt)}</td>
              <td>{timeTag(invoice.jobFinishedAt)}</td>
              <td>{timeTag(invoice.dueAt)}</td>
              <td>{timeTag(invoice.paidAt)}</td>
              <td>{truncate(invoice.payorEntityId)}</td>
              <td>{truncate(invoice.payeeEntityId)}</td>
              <td>{truncate(invoice.sourceEstimateId)}</td>
              <td>{truncate(invoice.sourceInstallerEntityId)}</td>
              <td>{truncate(invoice.sourceClientEntityId)}</td>
              <td>{truncate(invoice.sourceRetailerEntityId)}</td>
              <td>{truncate(invoice.payeeAddressLine1)}</td>
              <td>{truncate(invoice.payeeAddressLine2)}</td>
              <td>{truncate(invoice.payeeCity)}</td>
              <td>{truncate(invoice.payeeState)}</td>
              <td>{truncate(invoice.payeePostalCode)}</td>
              <td>{truncate(invoice.payeeCountry)}</td>
              <td>{truncate(invoice.payorAddressLine1)}</td>
              <td>{truncate(invoice.payorAddressLine2)}</td>
              <td>{truncate(invoice.payorCity)}</td>
              <td>{truncate(invoice.payorState)}</td>
              <td>{truncate(invoice.payorPostalCode)}</td>
              <td>{truncate(invoice.payorCountry)}</td>
              <td>{truncate(invoice.jobAddressLine1)}</td>
              <td>{truncate(invoice.jobAddressLine2)}</td>
              <td>{truncate(invoice.jobCity)}</td>
              <td>{truncate(invoice.jobState)}</td>
              <td>{truncate(invoice.jobPostalCode)}</td>
              <td>{truncate(invoice.jobCountry)}</td>
              <td>{truncate(invoice.subtotal)}</td>
              <td>{truncate(invoice.taxTotal)}</td>
              <td>{truncate(invoice.total)}</td>
              <td>{truncate(invoice.notes)}</td>
              <td>{truncate(invoice.entityId)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.invoice({ uuid: invoice.uuid })}
                    title={'Show invoice ' + invoice.uuid + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editInvoice({ uuid: invoice.uuid })}
                    title={'Edit invoice ' + invoice.uuid}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete invoice ' + invoice.uuid}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(invoice.uuid)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InvoicesList
