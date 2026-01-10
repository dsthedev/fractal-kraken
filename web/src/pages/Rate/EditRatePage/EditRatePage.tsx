import EditRateCell from 'src/components/Rate/EditRateCell'

type RatePageProps = {
  id: number
}

const EditRatePage = ({ id }: RatePageProps) => {
  return <EditRateCell id={id} />
}

export default EditRatePage
