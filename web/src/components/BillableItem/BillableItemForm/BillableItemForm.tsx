import React from 'react'

import type {
  CreateBillableItemInput,
  UpdateBillableItemInput,
} from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextAreaField,
  Submit,
  useFormContext,
  useWatch,
} from '@cedarjs/forms'

import { CurrencyField } from 'src/components/ui/currency-field'
import {
  calculateSubtotal,
  calculateEstimatedHours,
  calculateHourlyRate,
} from 'src/lib/calculations.js'

type BillableItemLike = {
  id?: number
  actionId?: number
  materialId?: number
  unitId?: number
  action?: { id: number }
  material?: { id: number }
  unit?: { id: number }
  unitPrice?: number
  pricingType?: 'SUB' | 'RETAIL'
  quantity?: number
  subtotal?: number
  estimatedMinutesPerUnit?: number
  notes?: string | null
  authorId?: string
  estimate?: { pricingType?: 'SUB' | 'RETAIL' }
}

type BillableItemInput = UpdateBillableItemInput | CreateBillableItemInput

interface BillableItemFormProps {
  billableItem?: BillableItemLike
  onSave: (data: BillableItemInput, id?: number) => void
  error: RWGqlError
  loading: boolean
  authorId?: string
  pricingType?: 'SUB' | 'RETAIL'
  ActionDropdown: React.ComponentType<{
    value?: number
    onChange: (id: number) => void
  }>
  MaterialDropdown: React.ComponentType<{
    value?: number
    onChange: (id: number) => void
  }>
  UnitDropdown: React.ComponentType<{
    value?: number
    onChange: (id: number) => void
  }>
}

const resolveId = (
  direct?: number,
  nested?: { id: number }
): number | undefined => direct ?? nested?.id

const BillableItemDerivedMetrics = ({
  quantity,
  unitPrice,
  minutesPerUnit,
}: {
  quantity: number
  unitPrice: number
  minutesPerUnit: number
}) => {
  const subtotal = calculateSubtotal(unitPrice, quantity)

  const estimatedHours =
    minutesPerUnit > 0 && quantity > 0
      ? calculateEstimatedHours(minutesPerUnit, quantity)
      : '~0.00 hrs'

  const hourlyRate =
    minutesPerUnit > 0 && quantity > 0
      ? calculateHourlyRate(subtotal, minutesPerUnit, quantity)
      : '~$0.00/hr'

  return (
    <div className="flex gap-4 text-sm text-gray-600 mt-1">
      <div>{estimatedHours}</div>
      <div>{hourlyRate}</div>
    </div>
  )
}

const BillableItemFormInner = ({
  billableItem,
  pricingType,
  ActionDropdown,
  MaterialDropdown,
  UnitDropdown,
  selectedAction,
  setSelectedAction,
  selectedMaterial,
  setSelectedMaterial,
  selectedUnit,
  setSelectedUnit,
  error,
}: any) => {
  const { control, setValue } = useFormContext()

  const quantity = useWatch({
    control,
    name: 'quantity',
    defaultValue: billableItem?.quantity ?? 1,
  }) as number

  const unitPrice = useWatch({
    control,
    name: 'unitPrice',
    defaultValue: billableItem?.unitPrice ?? 0,
  }) as number

  const minutesPerUnit = useWatch({
    control,
    name: 'estimatedMinutesPerUnit',
    defaultValue: billableItem?.estimatedMinutesPerUnit ?? 0,
  }) as number

  React.useEffect(() => {
    setValue('subtotal', calculateSubtotal(unitPrice, quantity))
  }, [unitPrice, quantity, setValue])

  return (
    <>
      <FormError error={error} />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <Label name="quantity">Quantity</Label>
            <NumberField
              name="quantity"
              defaultValue={billableItem?.quantity ?? 1}
              validation={{ required: true, valueAsNumber: true }}
              onFocus={(e: any) => {
                requestAnimationFrame(() => e.target.select())
              }}
              className="rw-input w-20"
            />
            <FieldError name="quantity" />
          </div>

          <div>
            <Label name="unit">Unit</Label>
            <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ActionDropdown value={selectedAction} onChange={setSelectedAction} />
          <MaterialDropdown
            value={selectedMaterial}
            onChange={setSelectedMaterial}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <Label name="pricingType">Pricing type</Label>
            <select
              name="pricingType"
              value={pricingType}
              disabled
              className="rw-input w-full"
            >
              <option value="RETAIL">Retail</option>
              <option value="SUB">Sub</option>
            </select>

            <CurrencyField
              name="unitPrice"
              label="Unit price"
              required
              defaultValue={billableItem?.unitPrice ?? 0}
              onFocus={() => {}}
            />
          </div>

          <CurrencyField
            name="subtotal"
            label="Subtotal"
            required
            readOnly
            defaultValue={
              billableItem?.subtotal ??
              calculateSubtotal(
                billableItem?.unitPrice ?? 0,
                billableItem?.quantity ?? 1
              )
            }
          />
        </div>

        <Label name="estimatedMinutesPerUnit">Estimated minutes per unit</Label>

        <NumberField
          name="estimatedMinutesPerUnit"
          defaultValue={billableItem?.estimatedMinutesPerUnit}
          className="rw-input"
          onFocus={(e: any) => {
            requestAnimationFrame(() => e.target.select())
          }}
        />

        <BillableItemDerivedMetrics
          quantity={quantity}
          unitPrice={unitPrice}
          minutesPerUnit={minutesPerUnit}
        />

        <Label name="notes">Notes</Label>
        <TextAreaField
          name="notes"
          defaultValue={billableItem?.notes}
          rows={5}
          className="rw-input resize-none"
        />
      </div>
    </>
  )
}

const BillableItemForm = ({
  billableItem,
  onSave,
  error,
  loading,
  authorId,
  pricingType,
  ActionDropdown,
  MaterialDropdown,
  UnitDropdown,
}: BillableItemFormProps) => {
  const [selectedAction, setSelectedAction] = React.useState(
    resolveId(billableItem?.actionId, billableItem?.action)
  )
  const [selectedMaterial, setSelectedMaterial] = React.useState(
    resolveId(billableItem?.materialId, billableItem?.material)
  )
  const [selectedUnit, setSelectedUnit] = React.useState(
    resolveId(billableItem?.unitId, billableItem?.unit)
  )

  const resolvedPricingType =
    pricingType ??
    billableItem?.estimate?.pricingType ??
    billableItem?.pricingType ??
    'RETAIL'

  const onSubmit = (data: BillableItemLike) => {
    if (!selectedAction || !selectedUnit) {
      throw new Error('Action and Unit are required')
    }
    const parseNumber = (v: any): number | undefined => {
      if (v == null || v === '') return undefined
      if (typeof v === 'number') return v
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.-]+/g, '')
        const n = parseFloat(cleaned)
        return Number.isFinite(n) ? n : undefined
      }
      return undefined
    }

    const payload = {
      ...data,
      actionId: selectedAction,
      materialId: selectedMaterial,
      unitId: selectedUnit,
      authorId: authorId ?? data.authorId,
      pricingType: resolvedPricingType,
      quantity: data.quantity ?? 1,
      unitPrice: parseNumber((data as any).unitPrice) ?? 0,
      subtotal: parseNumber((data as any).subtotal) ?? 0,
      estimatedMinutesPerUnit:
        parseNumber((data as any).estimatedMinutesPerUnit) ?? undefined,
    }

    onSave(payload as BillableItemInput, billableItem?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<BillableItemLike> onSubmit={onSubmit} error={error}>
        <BillableItemFormInner
          billableItem={billableItem}
          pricingType={resolvedPricingType}
          ActionDropdown={ActionDropdown}
          MaterialDropdown={MaterialDropdown}
          UnitDropdown={UnitDropdown}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />

        <div className="rw-button-group mt-6">
          <Submit disabled={loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default BillableItemForm
