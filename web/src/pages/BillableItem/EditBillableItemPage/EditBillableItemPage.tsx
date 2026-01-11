import EditBillableItemCell from 'src/components/BillableItem/EditBillableItemCell'

type BillableItemPageProps = {
  id: number
}

const EditBillableItemPage = ({ id }: BillableItemPageProps) => {
  return <EditBillableItemCell id={id} />
}

export default EditBillableItemPage
