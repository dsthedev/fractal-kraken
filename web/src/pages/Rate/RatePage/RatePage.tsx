import RateCell from 'src/components/Rate/RateCell'

type RatePageProps = {
  id: number
}

const RatePage = ({ id }: RatePageProps) => {
  return <RateCell id={id} />
}

export default RatePage
