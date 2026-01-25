import React from 'react'

import { Pencil } from 'lucide-react'
import type {
  EditBillableItemById,
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
  TextField,
  TextAreaField,
  Submit,
  useFormContext,
  useWatch,
} from '@cedarjs/forms'

import { CurrencyField } from 'src/components/ui/currency-field'
// router/button not used in this component
import {
  calculateSubtotal,
  calculateEstimatedHours,
  calculateHourlyRate,
} from 'src/lib/calculations.js'

// Lightweight local type to accept billable item shapes from different queries
type BillableItemLike = {
  id?: number
  actionId?: number
  materialId?: number
  unitId?: number
  action?: { id: number }
  material?: { id: number }
  unit?: { id: number }
  unitPrice?: number
  pricingType?: any
  quantity?: number
  subtotal?: number | string
  estimatedMinutesPerUnit?: number
  notes?: string | null
  authorId?: string
  createdAt?: string
  updatedAt?: string
  author?: any
  estimate?: any
}

type FormBillableItem = BillableItemLike
type BillableItemInput = UpdateBillableItemInput | CreateBillableItemInput

interface BillableItemFormProps {
  billableItem?: FormBillableItem
  onSave: (data: BillableItemInput, id?: FormBillableItem['id']) => void
  error: RWGqlError
  loading: boolean
  authorId?: string
  pricingType?: 'SUB' | 'RETAIL'
  // no serviceId any more; unitId not required here — form reads from billableItem
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

const HiddenField = ({
  name,
  value,
  required = false,
  asNumber = false,
}: {
  name: string
  value?: string | number
  required?: boolean
  asNumber?: boolean
}) => (
  <Label name={name} className="hidden" errorClassName="">
    {name}
    <TextField
      name={name}
      defaultValue={value}
      readOnly
      className="hidden"
      errorClassName=""
      validation={
        required ? { required: true, valueAsNumber: asNumber } : undefined
      }
    />
    <FieldError name={name} className="" />
  </Label>
)

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
  const [selectedAction, setSelectedAction] = React.useState<
    number | undefined
  >(billableItem?.actionId ?? billableItem?.action?.id)
  const [selectedMaterial, setSelectedMaterial] = React.useState<
    number | undefined
  >(billableItem?.materialId ?? billableItem?.material?.id ?? undefined)
  const [selectedUnit, setSelectedUnit] = React.useState<number | undefined>(
    billableItem?.unitId ?? billableItem?.unit?.id
  )
  const [pricingTypeState, setPricingTypeState] = React.useState<
    'SUB' | 'RETAIL'
  >(() => {
    // priority: prop pricingType > billableItem.pricingType > RETAIL
    if (typeof pricingType !== 'undefined') return pricingType
    // prefer estimate-level pricing type when creating new items
    const ep = (billableItem as any)?.estimate?.pricingType
    if (typeof ep === 'string') return ep as 'SUB' | 'RETAIL'
    const p = billableItem?.pricingType
    if (typeof p === 'string') return p as 'SUB' | 'RETAIL'
    if (p && typeof (p as any).includes === 'function') {
      return (p as any).includes('SUB') ? 'SUB' : 'RETAIL'
    }
    return 'RETAIL'
  })

  const initialQuantity = billableItem?.quantity ?? 1
  const [estimatedHours, setEstimatedHours] = React.useState(
    billableItem?.estimatedMinutesPerUnit && initialQuantity
      ? calculateEstimatedHours(
          billableItem.estimatedMinutesPerUnit,
          initialQuantity
        )
      : '~0.00 hrs'
  )
  const [hourlyRate, setHourlyRate] = React.useState(
    billableItem?.estimatedMinutesPerUnit && initialQuantity &&
      billableItem?.subtotal
      ? calculateHourlyRate(
          Number(billableItem.subtotal),
          billableItem.estimatedMinutesPerUnit,
          initialQuantity
        )
      : '~$0.00/hr'
  )

  // Keep selected IDs in sync if props change
  React.useEffect(() => {
    const aid = billableItem?.actionId ?? billableItem?.action?.id
    if (aid !== undefined) setSelectedAction(aid)
  }, [billableItem])

  React.useEffect(() => {
    const uid = billableItem?.unitId ?? billableItem?.unit?.id
    if (uid !== undefined) setSelectedUnit(uid)
  }, [billableItem])

  React.useEffect(() => {
    // keep pricing type in sync when editing an existing item or when parent passes a prop
    if (typeof pricingType !== 'undefined') {
      setPricingTypeState(pricingType)
      return
    }
    const p = billableItem?.pricingType
    if (typeof p === 'string') setPricingTypeState(p as 'SUB' | 'RETAIL')
    else if (p && typeof (p as any).includes === 'function')
      setPricingTypeState((p as any).includes('SUB') ? 'SUB' : 'RETAIL')
  }, [billableItem, pricingType])

  React.useEffect(() => {
    const mid = billableItem?.materialId ?? billableItem?.material?.id
    if (mid !== undefined) setSelectedMaterial(mid)
  }, [billableItem])

  // Move form-context logic into a child component so hooks run inside the Form provider
  const BillableItemFormInner = ({
    billableItem,
    selectedAction,
    setSelectedAction,
    selectedMaterial,
    setSelectedMaterial,
    selectedUnit,
    setSelectedUnit,
    pricingTypeState,
    setPricingTypeState,
    estimatedHours,
    setEstimatedHours,
    hourlyRate,
    setHourlyRate,
  }: {
    billableItem?: FormBillableItem
    selectedAction?: number
    setSelectedAction: (id?: number) => void
    selectedMaterial?: number
    setSelectedMaterial: (id?: number) => void
    selectedUnit?: number
    setSelectedUnit: (id?: number) => void
    pricingTypeState: 'SUB' | 'RETAIL'
    setPricingTypeState: (t: 'SUB' | 'RETAIL') => void
    estimatedHours: string
    setEstimatedHours: (s: string) => void
    hourlyRate: string
    setHourlyRate: (s: string) => void
  }) => {
    const { control, setValue } = useFormContext()

    const watchedUnitPrice = useWatch({
      control,
      name: 'unitPrice',
      defaultValue: billableItem?.unitPrice ?? 0,
    }) as number | ''
    const watchedQuantity = useWatch({
      control,
      name: 'quantity',
      defaultValue: billableItem?.quantity ?? 1,
    }) as number | ''
    const watchedEstimatedMinutes = useWatch({
      control,
      name: 'estimatedMinutesPerUnit',
      defaultValue: billableItem?.estimatedMinutesPerUnit ?? 0,
    }) as number | ''

    React.useEffect(() => {
      const up = Number(watchedUnitPrice) || 0
      const q = Number(watchedQuantity) || 0
      const calculated = String(calculateSubtotal(up, q))
      setValue('subtotal', parseFloat(calculated) || 0)

      if ((Number(watchedEstimatedMinutes) || 0) > 0 && q > 0) {
        setHourlyRate(
          calculateHourlyRate(
            parseFloat(calculated) || 0,
            Number(watchedEstimatedMinutes),
            q
          )
        )
      } else {
        setHourlyRate('~$0.00/hr')
      }
    }, [
      watchedUnitPrice,
      watchedQuantity,
      watchedEstimatedMinutes,
      setValue,
      setHourlyRate,
    ])

    const handlePriceOrQuantityChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      field: 'unitPrice' | 'quantity'
    ) => {
      const form = event.target.form
      const unitPrice =
        field === 'unitPrice'
          ? parseFloat(event.target.value) || 0
          : parseFloat(form?.unitPrice?.value) || 0
      const quantity =
        field === 'quantity'
          ? parseFloat(event.target.value) || 0
          : parseFloat(form?.quantity?.value) || 0

      const calculatedSubtotal = calculateSubtotal(unitPrice, quantity)
      setValue('subtotal', parseFloat(String(calculatedSubtotal)) || 0)

      if (field === 'quantity') {
        const minutesPerUnit =
          parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
        if (minutesPerUnit > 0) {
          setEstimatedHours(calculateEstimatedHours(minutesPerUnit, quantity))
          setHourlyRate(
            calculateHourlyRate(
              parseFloat(String(calculatedSubtotal)),
              minutesPerUnit,
              quantity
            )
          )
        }
      } else {
        const minutesPerUnit =
          parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
        if (minutesPerUnit > 0 && quantity > 0) {
          setHourlyRate(
            calculateHourlyRate(
              parseFloat(String(calculatedSubtotal)),
              minutesPerUnit,
              quantity
            )
          )
        }
      }
    }

    const handleMinutesOrQuantityChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      field: 'estimatedMinutesPerUnit' | 'quantity'
    ) => {
      const form = event.target.form
      const minutesPerUnit =
        field === 'estimatedMinutesPerUnit'
          ? parseFloat(event.target.value) || 0
          : parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
      const quantity =
        field === 'quantity'
          ? parseFloat(event.target.value) || 0
          : parseFloat(form?.quantity?.value) || 0

      if (minutesPerUnit > 0 && quantity > 0) {
        setEstimatedHours(calculateEstimatedHours(minutesPerUnit, quantity))
        const currentSubtotal = parseFloat(form?.subtotal?.value) || 0
        setHourlyRate(
          calculateHourlyRate(currentSubtotal, minutesPerUnit, quantity)
        )
      } else {
        setEstimatedHours('~0.00 hrs')
        setHourlyRate('~$0.00/hr')
      }
    }

    return (
      <>
        <FormError
          error={error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Hidden author */}
        <HiddenField
          name="authorId"
          value={authorId ?? billableItem?.authorId}
          required
          asNumber={false}
        />

        <div className="space-y-4">
          {/* Row 1: Qty | Unit */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label
                name="quantity"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Quantity
              </Label>
              <NumberField
                name="quantity"
                defaultValue={billableItem?.quantity ?? 1}
                className="rw-input w-14"
                errorClassName="rw-input rw-input-error"
                validation={{ valueAsNumber: true, required: true }}
                onChange={(e) => {
                  handlePriceOrQuantityChange(e, 'quantity')
                  handleMinutesOrQuantityChange(e, 'quantity')
                }}
              />
              <FieldError name="quantity" className="rw-field-error" />
            </div>

            <div>
              <Label
                name="unit"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Unit
              </Label>
              <div>
                <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
              </div>
            </div>
          </div>

          {/* Row 2: Action | Material */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ActionDropdown
                value={selectedAction}
                onChange={setSelectedAction}
              />
            </div>
            <div>
              <MaterialDropdown
                value={selectedMaterial}
                onChange={setSelectedMaterial}
              />
            </div>
          </div>

          {/* Row 3: Pricing type + Unit price (left) | Subtotal (right) */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label
                name="pricingType"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Pricing type
              </Label>
              <select
                name="pricingType"
                value={pricingTypeState}
                onChange={(e) =>
                  setPricingTypeState(e.target.value as 'SUB' | 'RETAIL')
                }
                className="rw-input w-full"
              >
                <option value="RETAIL">Retail</option>
                <option value="SUB">Sub</option>
              </select>

              <CurrencyField
                name="unitPrice"
                label="Unit price"
                defaultValue={billableItem?.unitPrice}
                required
                className="w-full"
              />
            </div>

            <div>
              <CurrencyField
                name="subtotal"
                label="Subtotal"
                defaultValue={Number(billableItem?.subtotal ?? 0)}
                required
                className="w-full"
              />
              <FieldError name="subtotal" className="rw-field-error" />
            </div>
          </div>
        </div>

        <Label
          name="notes"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notes
        </Label>

        <TextAreaField
          name="notes"
          defaultValue={billableItem?.notes}
          className="rw-input resize-none"
          errorClassName="rw-input rw-input-error"
          rows={6}
        />

        <FieldError name="notes" className="rw-field-error" />

        <Label
          name="estimatedMinutesPerUnit"
          className="rw-label mt-4"
          errorClassName="rw-label rw-label-error"
        >
          Estimated minutes per unit
        </Label>

        <NumberField
          name="estimatedMinutesPerUnit"
          defaultValue={billableItem?.estimatedMinutesPerUnit}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          onChange={(e) =>
            handleMinutesOrQuantityChange(e, 'estimatedMinutesPerUnit')
          }
        />

        <FieldError name="estimatedMinutesPerUnit" className="rw-field-error" />

        <div className="flex gap-4 text-sm text-gray-600 mt-1">
          <div>{estimatedHours}</div>
          <div>{hourlyRate}</div>
        </div>

        <div className="rw-button-group mt-6">
          <Submit disabled={loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </>
    )
  }

  const onSubmit = (data: FormBillableItem) => {
    const finalActionId = selectedAction
    const finalUnitId = selectedUnit
    const finalAuthorId = authorId ?? String(data.authorId)

    if (!finalActionId || !finalUnitId) {
      throw new Error('Action and Unit must be selected before saving')
    }
    if (!finalAuthorId) {
      throw new Error('Author ID is required')
    }

    // Exclude id, timestamps, and relations from spread for create operations
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      action: _action,
      unit: _unit,
      author: _author,
      estimate: _estimate,
      ...inputData
    } = data

    const payload = {
      ...inputData,
      actionId: finalActionId,
      materialId: selectedMaterial,
      unitId: finalUnitId,
      authorId: finalAuthorId,
      pricingType: pricingTypeState,
    } as any

    if (payload.quantity == null) payload.quantity = 1

    onSave(payload, billableItem?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormBillableItem> onSubmit={onSubmit} error={error}>
        <BillableItemFormInner
          billableItem={billableItem}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          pricingTypeState={pricingTypeState}
          setPricingTypeState={setPricingTypeState}
          estimatedHours={estimatedHours}
          setEstimatedHours={setEstimatedHours}
          hourlyRate={hourlyRate}
          setHourlyRate={setHourlyRate}
        />
      </Form>
    </div>
  )
}

export default BillableItemForm
