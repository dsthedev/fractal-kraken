import React from 'react'

import { Pencil } from 'lucide-react'
import type { EditRateById, UpdateRateInput } from 'types/graphql'
import type { EditMeasurementUnitCellById } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  TextAreaField,
  Submit,
  useFormContext,
  useWatch,
} from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'
import { useQuery } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'
import { CurrencyField } from 'src/components/ui/currency-field'
import formatRatePerHour from 'src/lib/utils'

// Query and mutation for MeasurementUnit
const UNIT_QUERY: TypedDocumentNode<EditMeasurementUnitCellById> = gql`
  query RateFormUnitById($id: Int!) {
    measurementUnit: measurementUnit(id: $id) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
      description
      createdAt
      updatedAt
    }
  }
`

// const UPDATE_UNIT_MUTATION: TypedDocumentNode<EditMeasurementUnitCellById> = gql`
//   mutation UpdateRateFormUnitMutation(
//     $id: Int!
//     $input: UpdateMeasurementUnitInput!
//   ) {
//     updateMeasurementUnit(id: $id, input: $input) {
//       id
//       fullName
//       pluralName
//       shortName
//       symbol
//       notation
//       description
//       createdAt
//       updatedAt
//     }
//   }
// `

type FormRate = NonNullable<EditRateById['rate']>

interface RateFormProps {
  rate?: EditRateById['rate']
  onSave: (data: UpdateRateInput, id?: FormRate['id']) => void
  error: RWGqlError
  loading: boolean
  authorId?: string
  actionId?: number
  materialId?: number
  estimatedMinutesPerUnit?: number
  unitId?: number
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
  </>
)

const ComputedRateDisplay = ({
  rate,
  selectedUnit,
}: {
  rate?: EditRateById['rate']
  selectedUnit?: number
}) => {
  const { control } = useFormContext()

  const estimated = useWatch({
    control,
    name: 'estimatedMinutesPerUnit' as const,
    defaultValue: rate?.estimatedMinutesPerUnit,
  }) as number | undefined

  const subAmount = useWatch({
    control,
    name: 'subAmount' as const,
    defaultValue: rate?.subAmount,
  }) as number | undefined

  const retailAmount = useWatch({
    control,
    name: 'retailAmount' as const,
    defaultValue: rate?.retailAmount,
  }) as number | undefined

  const unitId = selectedUnit ?? rate?.unitId

  const { data } = useQuery<EditMeasurementUnitCellById>(UNIT_QUERY, {
    variables: { id: unitId as number },
    skip: !unitId,
  })

  const unit = (data && data.measurementUnit) ?? rate?.unit

  const text = formatRatePerHour({
    estimatedMinutesPerUnit: estimated as number | undefined,
    subAmount: subAmount as number | undefined,
    retailAmount: retailAmount as number | undefined,
    unit: unit as any,
    unitFallback: (rate?.unit ?? undefined) as any,
  })

  return (
    <span className="text-sm text-muted-foreground mt-2 block">{text}</span>
  )
}

const RateForm = ({
  rate,
  onSave,
  error,
  loading,
  authorId,
  actionId,
  materialId,
  unitId,
  ActionDropdown,
  MaterialDropdown,
  UnitDropdown,
}: RateFormProps) => {
  const [selectedAction, setSelectedAction] = React.useState<
    number | undefined
  >(actionId ?? rate?.actionId)
  const [selectedMaterial, setSelectedMaterial] = React.useState<
    number | undefined
  >(materialId ?? rate?.materialId)
  const [selectedUnit, setSelectedUnit] = React.useState<number | undefined>(
    unitId ?? rate?.unitId
  )

  React.useEffect(() => {
    if (actionId !== undefined) setSelectedAction(actionId)
  }, [actionId])

  React.useEffect(() => {
    if (materialId !== undefined) setSelectedMaterial(materialId)
  }, [materialId])

  React.useEffect(() => {
    if (unitId !== undefined) setSelectedUnit(unitId)
  }, [unitId])

  const onSubmit = (data: FormRate) => {
    const finalActionId = selectedAction
    const finalMaterialId = selectedMaterial
    const finalUnitId = selectedUnit
    const finalAuthorId = authorId ?? String(data.authorId)
    const minutesValue =
      data.estimatedMinutesPerUnit === undefined ||
      data.estimatedMinutesPerUnit === null
        ? undefined
        : Number(data.estimatedMinutesPerUnit)

    if (!finalActionId || !finalMaterialId || !finalUnitId) {
      throw new Error(
        'Action, Material and Unit must be selected before saving'
      )
    }
    if (!finalAuthorId) {
      throw new Error('Author ID is required')
    }

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      action: _action,
      material: _material,
      unit: _unit,
      ...restData
    } = data

    onSave(
      {
        ...restData,
        actionId: finalActionId,
        materialId: finalMaterialId,
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

        <HiddenField
          name="authorId"
          value={authorId ?? rate?.authorId}
          required
          asNumber={false}
        />

        <div className="flex gap-4 mt-2">
          <div className="flex-1 flex gap-2 items-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (selectedAction) {
                  navigate(routes.editAction({ id: selectedAction }))
                }
              }}
              disabled={!selectedAction}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              {/* Action dropdown */}
              {/* @ts-ignore */}
              <ActionDropdown
                value={selectedAction}
                onChange={setSelectedAction}
              />
            </div>
          </div>

          <div className="flex-1 flex gap-2 items-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (selectedMaterial) {
                  navigate(routes.editMaterial({ id: selectedMaterial }))
                }
              }}
              disabled={!selectedMaterial}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              {/* Material dropdown */}
              {/* @ts-ignore */}
              <MaterialDropdown
                value={selectedMaterial}
                onChange={setSelectedMaterial}
              />
            </div>
          </div>

          <div className="flex-1 flex gap-2 items-end border-l pl-4">
            <div className="flex-1">
              <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (selectedUnit) {
                  navigate(routes.editMeasurementUnit({ id: selectedUnit }))
                }
              }}
              disabled={!selectedUnit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        <div className="mt-4 flex flex-col sm:flex-row justify-stretch gap-4">
          <div className="flex-col flex-1">
            <LabeledField
              name="context"
              label="Context"
              defaultValue={(rate as any)?.context}
            />
          </div>
          <div className="flex-col flex-1">
            <LabeledField
              name="estimatedMinutesPerUnit"
              label="Estimated Minutes per Unit"
              defaultValue={rate?.estimatedMinutesPerUnit}
              type="number"
            />
          </div>
        </div>

        <div className="mt-4">
          <ComputedRateDisplay rate={rate} selectedUnit={selectedUnit} />
          <hr className="my-4" />
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
