import EditInvoiceCell from 'src/components/Invoice/EditInvoiceCell'

type InvoicePageProps = {
  uuid: string
}

const EditInvoicePage = ({ uuid }: InvoicePageProps) => {
  return <EditInvoiceCell uuid={uuid} />
}

export default EditInvoicePage
