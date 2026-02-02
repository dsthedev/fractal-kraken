import InvoiceCell from 'src/components/Invoice/InvoiceCell'

type InvoicePageProps = {
  uuid: string
}

const InvoicePage = ({ uuid }: InvoicePageProps) => {
  return <InvoiceCell uuid={uuid} />
}

export default InvoicePage
