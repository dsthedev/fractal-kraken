import type { EditBillableItemById, UpdateBillableItemInput } from 'types/graphql'
import type { CreateBillableItemInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'

import { useAuth } from 'src/auth'
import BillableItemForm from 'src/components/BillableItem/BillableItemForm'
import SelectMeasurementUnitCell from 'src/components/MeasurementUnit/SelectMeasurementUnitCell'
import SelectServiceCell from 'src/components/Service/SelectServiceCell'

type FormBillableItem = NonNullable<EditBillableItemById['billableItem']>
type BillableItemInput = UpdateBillableItemInput | CreateBillableItemInput

interface BillableItemFormWrapperProps {
  billableItem?: EditBillableItemById['billableItem']
  onSave: (data: BillableItemInput, id?: FormBillableItem['id']) => void
  error: RWGqlError
  loading: boolean
}

const BillableItemFormWrapper = (props: BillableItemFormWrapperProps) => {
  const { currentUser } = useAuth()

  return (
    <BillableItemForm
      billableItem={props.billableItem}
      onSave={props.onSave}
      error={props.error}
      loading={props.loading}
      authorId={currentUser?.id}
      serviceId={props.billableItem?.serviceId}
      unitId={props.billableItem?.unitId}
      ServiceDropdown={({ value, onChange }) => (
        <SelectServiceCell onSelect={onChange} selectedId={value} />
      )}
      UnitDropdown={({ value, onChange }) => (
        <SelectMeasurementUnitCell onSelect={onChange} selectedId={value} />
      )}
    />
  )
}

export default BillableItemFormWrapper
