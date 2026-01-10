import type {
  EditMeasurementUnitById,
  UpdateMeasurementUnitInput,
} from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  RadioField,
  Submit,
} from '@cedarjs/forms'

// ============================================================================
// ENUM OPTIONS
// ============================================================================
// Define enum options for dimension and category fields
// These should match the Prisma schema enums

const DIMENSION_OPTIONS = [
  { value: 'LINEAR', label: 'Linear' },
  { value: 'SQUARE', label: 'Square' },
  { value: 'CUBIC', label: 'Cubic' },
  { value: 'VOLUME', label: 'Volume' },
  { value: 'TEMPORAL', label: 'Temporal' },
  { value: 'COUNT', label: 'Count' },
  { value: 'AREA', label: 'Area' },
  { value: 'CUSTOM', label: 'Custom' },
] as const

// ============================================================================
// FORM TYPES
// ============================================================================

type FormMeasurementUnit = NonNullable<
  EditMeasurementUnitById['measurementUnit']
>

interface MeasurementUnitFormProps {
  measurementUnit?: EditMeasurementUnitById['measurementUnit']
  onSave: (
    data: UpdateMeasurementUnitInput,
    id?: FormMeasurementUnit['id']
  ) => void
  error: RWGqlError
  loading: boolean
}

// ============================================================================
// MEASUREMENT UNIT FORM COMPONENT
// ============================================================================

const MeasurementUnitForm = (props: MeasurementUnitFormProps) => {
  const onSubmit = (data: FormMeasurementUnit) => {
    props.onSave(data, props?.measurementUnit?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormMeasurementUnit> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="fullName"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Full name
        </Label>
        <TextField
          name="fullName"
          defaultValue={props.measurementUnit?.fullName}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="fullName" className="rw-field-error" />

        <Label
          name="pluralName"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Plural name
        </Label>
        <TextField
          name="pluralName"
          defaultValue={props.measurementUnit?.pluralName}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="pluralName" className="rw-field-error" />

        <Label
          name="shortName"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Short name
        </Label>
        <TextField
          name="shortName"
          defaultValue={props.measurementUnit?.shortName}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="shortName" className="rw-field-error" />

        <Label
          name="symbol"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Symbol
        </Label>
        <TextField
          name="symbol"
          defaultValue={props.measurementUnit?.symbol}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="symbol" className="rw-field-error" />

        <Label
          name="notation"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notation
        </Label>
        <TextField
          name="notation"
          defaultValue={props.measurementUnit?.notation}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="notation" className="rw-field-error" />

        <Label
          name="dimension"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Dimension
        </Label>
        {DIMENSION_OPTIONS.map((option, index) => (
          <div key={option.value} className="rw-check-radio-items">
            <RadioField
              id={`measurementUnit-dimension-${index}`}
              name="dimension"
              defaultValue={option.value}
              defaultChecked={props.measurementUnit?.dimension?.includes(
                option.value
              )}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <div>{option.label}</div>
          </div>
        ))}
        <FieldError name="dimension" className="rw-field-error" />

        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>
        <TextField
          name="description"
          defaultValue={props.measurementUnit?.description}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="description" className="rw-field-error" />

        <Label
          name="conversionFactor"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Conversion factor
        </Label>
        <TextField
          name="conversionFactor"
          defaultValue={props.measurementUnit?.conversionFactor}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true }}
        />
        <FieldError name="conversionFactor" className="rw-field-error" />

        <Label
          name="baseUnit"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Base unit
        </Label>
        <TextField
          name="baseUnit"
          defaultValue={props.measurementUnit?.baseUnit}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="baseUnit" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default MeasurementUnitForm
