import EditMeasurementUnitCell from 'src/components/MeasurementUnit/EditMeasurementUnitCell'

type MeasurementUnitPageProps = {
  id: number
}

const EditMeasurementUnitPage = ({ id }: MeasurementUnitPageProps) => {
  return <EditMeasurementUnitCell id={id} />
}

export default EditMeasurementUnitPage
