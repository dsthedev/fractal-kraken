import MeasurementUnitCell from 'src/components/MeasurementUnit/MeasurementUnitCell'

type MeasurementUnitPageProps = {
  id: number
}

const MeasurementUnitPage = ({ id }: MeasurementUnitPageProps) => {
  return <MeasurementUnitCell id={id} />
}

export default MeasurementUnitPage
