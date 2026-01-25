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
  RadioField,
  Submit,
} from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'

import { Button } from 'src/components/ui/button'
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
  const [subtotal, setSubtotal] = React.useState(
    billableItem?.subtotal?.toString() || '0.00'
  )
  const [estimatedHours, setEstimatedHours] = React.useState(
    billableItem?.estimatedMinutesPerUnit && billableItem?.quantity
      ? calculateEstimatedHours(
          billableItem.estimatedMinutesPerUnit,
          billableItem.quantity
        )
      : '~0.00 hrs'
  )
  const [hourlyRate, setHourlyRate] = React.useState(
    billableItem?.estimatedMinutesPerUnit &&
      billableItem?.quantity &&
      billableItem?.subtotal
      ? calculateHourlyRate(
          Number(billableItem.subtotal),
          billableItem.estimatedMinutesPerUnit,
          billableItem.quantity
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
    const mid = billableItem?.materialId ?? billableItem?.material?.id
    if (mid !== undefined) setSelectedMaterial(mid)
  }, [billableItem])

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
    setSubtotal(calculatedSubtotal)

    // Update estimated hours if quantity changed
    if (field === 'quantity') {
      const minutesPerUnit =
        parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
      if (minutesPerUnit > 0) {
        setEstimatedHours(calculateEstimatedHours(minutesPerUnit, quantity))
        setHourlyRate(
          calculateHourlyRate(
            parseFloat(calculatedSubtotal),
            minutesPerUnit,
            quantity
          )
        )
      }
    } else {
      // Update hourly rate when price changes
      const minutesPerUnit =
        parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
      if (minutesPerUnit > 0 && quantity > 0) {
        setHourlyRate(
          calculateHourlyRate(
            parseFloat(calculatedSubtotal),
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

    onSave(
      {
        ...inputData,
        actionId: finalActionId,
        materialId: selectedMaterial,
        unitId: finalUnitId,
        authorId: finalAuthorId,
      } as any,
      billableItem?.id
    )
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormBillableItem> onSubmit={onSubmit} error={error}>
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

        {/* Service + Unit Row (Dropdowns) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2 items-end">
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
          <div>
            <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
          </div>
        </div>

        <Label
          name="unitPrice"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Unit price
        </Label>

        <TextField
          name="unitPrice"
          defaultValue={billableItem?.unitPrice}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
          onChange={(e) => handlePriceOrQuantityChange(e, 'unitPrice')}
        />

        <FieldError name="unitPrice" className="rw-field-error" />

        <Label
          name="pricingType"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Pricing type
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="billableItem-pricingType-0"
            name="pricingType"
            defaultValue="SUB"
            defaultChecked={billableItem?.pricingType?.includes('SUB')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Sub</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="billableItem-pricingType-1"
            name="pricingType"
            defaultValue="RETAIL"
            defaultChecked={billableItem?.pricingType?.includes('RETAIL')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Retail</div>
        </div>

        <FieldError name="pricingType" className="rw-field-error" />

        <Label
          name="quantity"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Quantity
        </Label>

        <TextField
          name="quantity"
          defaultValue={billableItem?.quantity}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
          onChange={(e) => {
            handlePriceOrQuantityChange(e, 'quantity')
            handleMinutesOrQuantityChange(e, 'quantity')
          }}
        />

        <FieldError name="quantity" className="rw-field-error" />

        <Label
          name="subtotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Subtotal
        </Label>

        <TextField
          name="subtotal"
          value={subtotal}
          onChange={(e) => {
            setSubtotal(e.target.value)
            const form = e.target.form
            const minutesPerUnit =
              parseFloat(form?.estimatedMinutesPerUnit?.value) || 0
            const quantity = parseFloat(form?.quantity?.value) || 0
            if (minutesPerUnit > 0 && quantity > 0) {
              setHourlyRate(
                calculateHourlyRate(
                  parseFloat(e.target.value) || 0,
                  minutesPerUnit,
                  quantity
                )
              )
            }
          }}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="subtotal" className="rw-field-error" />

        <Label
          name="estimatedMinutesPerUnit"
          className="rw-label"
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
