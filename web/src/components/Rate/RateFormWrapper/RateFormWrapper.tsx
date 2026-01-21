import type { EditRateById, UpdateRateInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'

import { useAuth } from 'src/auth'
import SelectActionCell from 'src/components/Action/SelectActionCell'
import SelectMaterialCell from 'src/components/Material/SelectMaterialCell'
import SelectMeasurementUnitCell from 'src/components/MeasurementUnit/SelectMeasurementUnitCell'
import RateForm from 'src/components/Rate/RateForm'

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
      actionId={props.rate?.actionId}
      materialId={props.rate?.materialId}
      unitId={props.rate?.unitId}
      ActionDropdown={({ value, onChange }) => (
        <SelectActionCell onSelect={onChange} selectedId={value} />
      )}
      MaterialDropdown={({ value, onChange }) => (
        <SelectMaterialCell onSelect={onChange} selectedId={value} />
      )}
      UnitDropdown={({ value, onChange }) => (
        <SelectMeasurementUnitCell onSelect={onChange} selectedId={value} />
      )}
    />
  )
}

export default RateFormWrapper
