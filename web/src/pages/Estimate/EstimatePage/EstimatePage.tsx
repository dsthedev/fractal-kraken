import EstimateCell from 'src/components/Estimate/EstimateCell'

type EstimatePageProps = {
  id: number
}

const EstimatePage = ({ id }: EstimatePageProps) => {
  return <EstimateCell id={id} />
}

export default EstimatePage
