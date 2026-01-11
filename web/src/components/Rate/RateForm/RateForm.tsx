import React from 'react'

import type { EditRateById, UpdateRateInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@cedarjs/forms'

import { CurrencyField } from 'src/components/ui/currency-field'

type FormRate = NonNullable<EditRateById['rate']>

interface RateFormProps {
  rate?: EditRateById['rate']
  onSave: (data: UpdateRateInput, id?: FormRate['id']) => void
  error: RWGqlError
  loading: boolean
  authorId?: string
  serviceId?: number
  estimatedMinutesPerUnit?: number
  unitId?: number
  ServiceDropdown: React.ComponentType<{
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

interface LabeledFieldProps {
  name: keyof FormRate
  label?: string
  defaultValue?: any
  required?: boolean
  readOnly?: boolean
  type?: 'text' | 'number'
  textarea?: boolean
  rows?: number
  className?: string
}

const LabeledField = ({
  name,
  label,
  defaultValue,
  required = false,
  readOnly = false,
  type = 'text',
  textarea = false,
  rows,
  className = '',
}: LabeledFieldProps) => (
  <>
    <Label
      name={name}
      className="rw-label"
      errorClassName="rw-label rw-label-error"
    >
      {label ?? name}
    </Label>
    {textarea ? (
      <TextAreaField
        name={name}
        defaultValue={defaultValue}
        rows={rows ?? 3}
        className={`rw-input resize-none ${className}`}
        errorClassName="rw-input rw-input-error"
      />
    ) : (
      <TextField
        name={name}
        defaultValue={defaultValue}
        className={`rw-input ${className} ${
          readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        errorClassName="rw-input rw-input-error"
        readOnly={readOnly}
        validation={
          type === 'number' || required
            ? {
                ...(required ? { required: true } : {}),
                ...(type === 'number' ? { valueAsNumber: true } : {}),
              }
            : undefined
        }
      />
    )}
    <FieldError name={name} className="rw-field-error" />
  </>
)

const RateForm = ({
  rate,
  onSave,
  error,
  loading,
  authorId,
  serviceId,
  unitId,
  ServiceDropdown,
  UnitDropdown,
}: RateFormProps) => {
  const [selectedService, setSelectedService] = React.useState<
    number | undefined
  >(serviceId ?? rate?.serviceId)
  const [selectedUnit, setSelectedUnit] = React.useState<number | undefined>(
    unitId ?? rate?.unitId
  )

  // Keep selected IDs in sync if props change (e.g., edit load)
  React.useEffect(() => {
    if (serviceId !== undefined) setSelectedService(serviceId)
  }, [serviceId])

  React.useEffect(() => {
    if (unitId !== undefined) setSelectedUnit(unitId)
  }, [unitId])

  const onSubmit = (data: FormRate) => {
    const finalServiceId = selectedService
    const finalUnitId = selectedUnit
    const finalAuthorId = authorId ?? String(data.authorId)
    const minutesValue =
      data.estimatedMinutesPerUnit === undefined ||
      data.estimatedMinutesPerUnit === null
        ? undefined
        : Number(data.estimatedMinutesPerUnit)

    if (!finalServiceId || !finalUnitId) {
      throw new Error('Service and Unit must be selected before saving')
    }
    if (!finalAuthorId) {
      throw new Error('Author ID is required')
    }

    onSave(
      {
        ...data,
        serviceId: finalServiceId,
        unitId: finalUnitId,
        authorId: finalAuthorId,
        subAmount: data.subAmount,
        retailAmount: data.retailAmount,
        estimatedMinutesPerUnit: minutesValue,
        currency: data.currency || 'USD',
      },
      rate?.id
    )
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormRate> onSubmit={onSubmit} error={error}>
        <FormError
          error={error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Hidden author (registered) */}
        <HiddenField
          name="authorId"
          value={authorId ?? rate?.authorId}
          required
          asNumber={false}
        />

        {/* Service + Unit Row (Dropdowns) */}
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <ServiceDropdown
              value={selectedService}
              onChange={setSelectedService}
            />
          </div>
          <div className="flex-1">
            <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
          </div>
        </div>

        {/* Sub + Retail + Currency Row */}
        <div className="flex gap-4 mt-4 items-end">
          <div className="flex-1">
            <CurrencyField
              name="subAmount"
              label="Sub amount"
              defaultValue={rate?.subAmount}
              required
            />
          </div>
          <div className="flex-1">
            <CurrencyField
              name="retailAmount"
              label="Retail amount"
              defaultValue={rate?.retailAmount}
              required
            />
          </div>
          <div className="w-24">
            <LabeledField
              name="currency"
              label="Currency"
              defaultValue={rate?.currency ?? 'USD'}
              readOnly
              className="text-center"
            />
          </div>
        </div>

        <div className="mt-4">
          <LabeledField
            name="estimatedMinutesPerUnit"
            label="Estimated Minutes per Unit"
            defaultValue={rate?.estimatedMinutesPerUnit}
            type="number"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <LabeledField
            name="description"
            label="Description"
            defaultValue={rate?.description}
            textarea
            rows={4}
          />
        </div>

        <div className="rw-button-group mt-6">
          <Submit disabled={loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default RateForm
