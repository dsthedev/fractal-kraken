import React from 'react'

import { Pencil, X } from 'lucide-react'
import type { EditRateById, UpdateRateInput } from 'types/graphql'
import type {
  EditServiceById,
  UpdateServiceInput,
  UpdateServiceMutationVariables,
  EditMeasurementUnitById,
  UpdateMeasurementUnitInput,
  UpdateMeasurementUnitMutationVariables,
} from 'types/graphql'

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
import { navigate, routes } from '@cedarjs/router'
import { useQuery, useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import MeasurementUnitForm from 'src/components/MeasurementUnit/MeasurementUnitForm'
import ServiceForm from 'src/components/Service/ServiceForm'
import { Button } from 'src/components/ui/button'
import { CurrencyField } from 'src/components/ui/currency-field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from 'src/components/ui/dialog'

// Query and mutation for Service
const SERVICE_QUERY: TypedDocumentNode<EditServiceById> = gql`
  query EditServiceById($id: Int!) {
    service: service(id: $id) {
      id
      action
      material
      context
      description
      createdAt
      updatedAt
    }
  }
`

const UPDATE_SERVICE_MUTATION: TypedDocumentNode<
  EditServiceById,
  UpdateServiceMutationVariables
> = gql`
  mutation UpdateServiceMutation($id: Int!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      action
      material
      context
      description
      createdAt
      updatedAt
    }
  }
`

// Query and mutation for MeasurementUnit
const UNIT_QUERY: TypedDocumentNode<EditMeasurementUnitById> = gql`
  query EditMeasurementUnitById($id: Int!) {
    measurementUnit: measurementUnit(id: $id) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
      dimension
      description
      conversionFactor
      baseUnit
      createdAt
      updatedAt
    }
  }
`

const UPDATE_UNIT_MUTATION: TypedDocumentNode<
  EditMeasurementUnitById,
  UpdateMeasurementUnitMutationVariables
> = gql`
  mutation UpdateMeasurementUnitMutation(
    $id: Int!
    $input: UpdateMeasurementUnitInput!
  ) {
    updateMeasurementUnit(id: $id, input: $input) {
      id
      fullName
      pluralName
      shortName
      symbol
      notation
      dimension
      description
      conversionFactor
      baseUnit
      createdAt
      updatedAt
    }
  }
`

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
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingType, setEditingType] = React.useState<
    'service' | 'unit' | null
  >(null)

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

    // Exclude id and timestamps from the submission data
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      service: _service,
      unit: _unit,
      author: _author,
      ...restData
    } = data

    onSave(
      {
        ...restData,
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
          <div className="flex-1 flex gap-2 items-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (selectedService) {
                  setEditingType('service')
                  setEditDialogOpen(true)
                }
              }}
              disabled={!selectedService}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <ServiceDropdown
                value={selectedService}
                onChange={setSelectedService}
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
                  setEditingType('unit')
                  setEditDialogOpen(true)
                }
              }}
              disabled={!selectedUnit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType === 'service'
                ? 'Edit Service'
                : 'Edit Measurement Unit'}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          {editingType === 'service' && selectedService && (
            <ServiceEditDialogContent
              serviceId={selectedService}
              onSave={() => setEditDialogOpen(false)}
            />
          )}

          {editingType === 'unit' && selectedUnit && (
            <UnitEditDialogContent
              unitId={selectedUnit}
              onSave={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Edit dialog content for Service
 * Loads and displays the ServiceForm in the dialog
 */
const ServiceEditDialogContent = ({
  serviceId,
  onSave,
}: {
  serviceId: number
  onSave: () => void
}) => {
  const { data, loading, error } = useQuery<EditServiceById>(SERVICE_QUERY, {
    variables: { id: serviceId },
  })

  const [updateService, { loading: saving, error: saveError }] = useMutation(
    UPDATE_SERVICE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Service updated')
        onSave()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center text-sm text-red-500">
        Failed to load service
      </div>
    )
  }

  if (!data?.service) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Service not found
      </div>
    )
  }

  const handleSave = (input: UpdateServiceInput) => {
    updateService({ variables: { id: serviceId, input } })
  }

  return (
    <div className="py-4">
      <ServiceForm
        service={data.service}
        onSave={handleSave}
        error={saveError}
        loading={saving}
      />
    </div>
  )
}

/**
 * Edit dialog content for MeasurementUnit
 * Loads and displays the MeasurementUnitForm in the dialog
 */
const UnitEditDialogContent = ({
  unitId,
  onSave,
}: {
  unitId: number
  onSave: () => void
}) => {
  const { data, loading, error } = useQuery<EditMeasurementUnitById>(
    UNIT_QUERY,
    {
      variables: { id: unitId },
    }
  )

  const [updateUnit, { loading: saving, error: saveError }] = useMutation(
    UPDATE_UNIT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Measurement unit updated')
        onSave()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center text-sm text-red-500">
        Failed to load measurement unit
      </div>
    )
  }

  if (!data?.measurementUnit) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Measurement unit not found
      </div>
    )
  }

  const handleSave = (input: UpdateMeasurementUnitInput) => {
    updateUnit({ variables: { id: unitId, input } })
  }

  return (
    <div className="py-4">
      <MeasurementUnitForm
        measurementUnit={data.measurementUnit}
        onSave={handleSave}
        error={saveError}
        loading={saving}
      />
    </div>
  )
}

export default RateForm
