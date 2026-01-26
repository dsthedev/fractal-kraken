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

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import { CurrencyField } from 'src/components/ui/currency-field'
import { buildRateSentence } from 'src/lib/rateSentence'
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

const ACTION_QUERY = gql`
  query RateFormActionById($id: Int!) {
    action: action(id: $id) {
      id
      name
    }
  }
`

const MATERIAL_QUERY = gql`
  query RateFormMaterialById($id: Int!) {
    material: material(id: $id) {
      id
      name
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

const _HiddenField = ({
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
  placeholder?: string
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
  placeholder,
  className = '',
}: LabeledFieldProps) => (
  <>
    <Label
      name={name}
      className="block font-light"
      errorClassName="rw-label rw-label-error"
    >
      {label ?? name}
    </Label>
    {textarea ? (
      <TextAreaField
        name={name}
        defaultValue={defaultValue}
        rows={rows ?? 3}
        placeholder={placeholder}
        className={`rw-input resize-none ${className}`}
        errorClassName="rw-input rw-input-error"
      />
    ) : (
      <TextField
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
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
    <span className="text-lg text-muted-foreground mt-2 block">{text}</span>
  )
}

const RateSentenceDisplay = ({
  rate,
  selectedAction,
  selectedMaterial,
  selectedUnit,
}: {
  rate?: EditRateById['rate']
  selectedAction?: number
  selectedMaterial?: number
  selectedUnit?: number
}) => {
  const { control } = useFormContext()

  const context = useWatch({
    control,
    name: 'context' as const,
    defaultValue: (rate as any)?.context,
  }) as string | undefined

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

  const currency = useWatch({
    control,
    name: 'currency' as const,
    defaultValue: rate?.currency ?? 'USD',
  }) as string | undefined

  const actionId = selectedAction ?? rate?.actionId
  const materialId = selectedMaterial ?? rate?.materialId
  const unitId = selectedUnit ?? rate?.unitId

  const { data: actionData } = useQuery(ACTION_QUERY, {
    variables: { id: actionId as number },
    skip: !actionId,
  })

  const { data: materialData } = useQuery(MATERIAL_QUERY, {
    variables: { id: materialId as number },
    skip: !materialId,
  })

  const { data: unitData } = useQuery<EditMeasurementUnitCellById>(UNIT_QUERY, {
    variables: { id: unitId as number },
    skip: !unitId,
  })

  const actionName =
    (actionData && actionData.action?.name) || rate?.action?.name
  const materialName =
    (materialData && materialData.material?.name) || rate?.material?.name
  const unit = (unitData && unitData.measurementUnit) || rate?.unit
  const unitName = unit?.shortName || unit?.fullName

  const sentence = buildRateSentence(
    actionName,
    materialName,
    context,
    subAmount,
    retailAmount,
    unitName,
    currency
  )

  return <p className="text-sm text-muted-foreground">{sentence}</p>
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
  const { currentUser } = useAuth()

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

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      action: _action,
      material: _material,
      unit: _unit,
      authorId: _authorId,
      ...restData
    } = data

    onSave(
      {
        ...restData,
        actionId: finalActionId,
        materialId: finalMaterialId,
        unitId: finalUnitId,
        subAmount: data.subAmount,
        retailAmount: data.retailAmount,
        estimatedMinutesPerUnit: minutesValue,
        currency: data.currency || 'USD',
        authorId: authorId ?? currentUser.id,
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

        <div className="flex items-center justify-center mb-6 text-center">
          <RateSentenceDisplay
            rate={rate}
            selectedAction={selectedAction}
            selectedMaterial={selectedMaterial}
            selectedUnit={selectedUnit}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex gap-2 items-end">
            {currentUser.roles.includes('superadmin') && (
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
            )}
            <div className="flex-1">
              {/* Action dropdown */}
              {/* @ts-ignore */}
              <ActionDropdown
                value={selectedAction}
                onChange={setSelectedAction}
              />
              <p className="text-xs text-muted-foreground mt-1">
                What type of work is this rate for?
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            {currentUser.roles.includes('superadmin') && (
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
            )}
            <div className="flex-1">
              {/* Material dropdown */}
              {/* @ts-ignore */}
              <MaterialDropdown
                value={selectedMaterial}
                onChange={setSelectedMaterial}
              />
              <p className="text-xs text-muted-foreground mt-1">
                What material/resource is this rate for?
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <LabeledField
              name="context"
              label="Context"
              placeholder="pattern, size, complexity..."
              defaultValue={(rate as any)?.context}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Modifier to distinguish similar rates
            </p>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <UnitDropdown value={selectedUnit} onChange={setSelectedUnit} />
            </div>
            {currentUser.roles.includes('superadmin') && (
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
            )}
          </div>

          <div className="flex-1">
            <CurrencyField
              name="subAmount"
              label="Sub amount"
              defaultValue={rate?.subAmount}
              currency={rate?.currency ?? 'USD'}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              The rate charged when subcontracting, a lower cost basis.
            </p>
          </div>

          <div className="flex-1">
            <CurrencyField
              name="retailAmount"
              label="Retail amount"
              defaultValue={rate?.retailAmount}
              currency={rate?.currency ?? 'USD'}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              The rate charged when selling to customers, a higher cost basis.
            </p>
          </div>
        </div>

        <div className="sr-only">
          <LabeledField
            name="currency"
            label="Currency"
            defaultValue={rate?.currency ?? 'USD'}
            readOnly
          />
        </div>

        <div className="mt-4">
          <hr className="my-4" />
          <LabeledField
            name="description"
            label="Description"
            defaultValue={rate?.description}
            textarea
            rows={4}
          />

          <div className="mt-4 flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-shrink-0 w-full md:w-40">
              <LabeledField
                name="estimatedMinutesPerUnit"
                label="~ Minutes per Unit"
                defaultValue={rate?.estimatedMinutesPerUnit}
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Approximate time (in minutes) to complete one unit of work.
              </p>
            </div>
            <div className="flex-1">
              <ComputedRateDisplay rate={rate} selectedUnit={selectedUnit} />
            </div>
          </div>
        </div>

        <div className="my-6 mx-auto flex w-full justify-center">
          <Button
            asChild
            variant="sky"
            size="lg"
            className="w-full md:max-w-md"
          >
            <Submit disabled={loading}>Save</Submit>
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default RateForm
