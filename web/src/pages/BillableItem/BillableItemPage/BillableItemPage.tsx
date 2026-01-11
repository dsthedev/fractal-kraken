import BillableItemCell from 'src/components/BillableItem/BillableItemCell'

type BillableItemPageProps = {
  id: number
}

const BillableItemPage = ({ id }: BillableItemPageProps) => {
  return <BillableItemCell id={id} />
}

export default BillableItemPage
