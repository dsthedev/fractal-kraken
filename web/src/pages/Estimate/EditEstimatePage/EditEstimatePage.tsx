import EditEstimateCell from 'src/components/Estimate/EditEstimateCell'

type EstimatePageProps = {
  id: number
}

const EditEstimatePage = ({ id }: EstimatePageProps) => {
  return <EditEstimateCell id={id} />
}

export default EditEstimatePage
