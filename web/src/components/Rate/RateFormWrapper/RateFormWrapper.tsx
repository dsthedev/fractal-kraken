import type { EditRateById, UpdateRateInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'

import { useAuth } from 'src/auth'
import SelectMeasurementUnitCell from 'src/components/MeasurementUnit/SelectMeasurementUnitCell'
import RateForm from 'src/components/Rate/RateForm'
import SelectServiceCell from 'src/components/Service/SelectServiceCell'

type FormRate = NonNullable<EditRateById['rate']>

interface RateFormWrapperProps {
  rate?: EditRateById['rate']
  onSave: (data: UpdateRateInput, id?: FormRate['id']) => void
  error: RWGqlError
  loading: boolean
}

const RateFormWrapper = (props: RateFormWrapperProps) => {
  const { currentUser } = useAuth()

  return (
    <RateForm
      rate={props.rate}
      onSave={props.onSave}
      error={props.error}
      loading={props.loading}
      authorId={currentUser?.id}
      serviceId={props.rate?.serviceId}
      unitId={props.rate?.unitId}
      ServiceDropdown={({ value, onChange }) => (
        <SelectServiceCell onSelect={onChange} selectedId={value} />
      )}
      UnitDropdown={({ value, onChange }) => (
        <SelectMeasurementUnitCell onSelect={onChange} selectedId={value} />
      )}
    />
  )
}

export default RateFormWrapper
