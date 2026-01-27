import { RateDescription } from 'src/components/Dashboard/ResourceDescriptions'
import RatesCell from 'src/components/Rate/RatesCell'

const RatesPage = () => {
  return (
    <>
      <RatesCell />
      <hr className="my-10" />
      <RateDescription />
    </>
  )
}

export default RatesPage
