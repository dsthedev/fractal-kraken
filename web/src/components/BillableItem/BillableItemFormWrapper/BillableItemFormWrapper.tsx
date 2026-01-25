import type {
  EditBillableItemById,
  UpdateBillableItemInput,
} from 'types/graphql'
import type { CreateBillableItemInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'

import { useAuth } from 'src/auth'
import SelectActionCell from 'src/components/Action/SelectActionCell'
import BillableItemForm from 'src/components/BillableItem/BillableItemForm'
import SelectMaterialCell from 'src/components/Material/SelectMaterialCell'
import SelectMeasurementUnitCell from 'src/components/MeasurementUnit/SelectMeasurementUnitCell'

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

export default BillableItemFormWrapper
