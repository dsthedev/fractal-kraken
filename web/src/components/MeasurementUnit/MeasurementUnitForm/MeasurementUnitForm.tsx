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
  TextAreaField,
  Submit,
} from '@cedarjs/forms'

// ============================================================================
// ENUM OPTIONS
// ============================================================================
// const DIMENSION_OPTIONS = [
//   { value: 'LINEAR', label: 'Linear' },
//   { value: 'SQUARE', label: 'Square' },
//   { value: 'CUBIC', label: 'Cubic' },
//   { value: 'VOLUME', label: 'Volume' },
//   { value: 'TEMPORAL', label: 'Temporal' },
//   { value: 'COUNT', label: 'Count' },
//   { value: 'AREA', label: 'Area' },
//   { value: 'CUSTOM', label: 'Custom' },
// ] as const

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

const MeasurementUnitForm = (props: MeasurementUnitFormProps) => {
  const onSubmit = (data: FormMeasurementUnit) => {
    // Exclude id and timestamps from the submission data
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...inputData
    } = data
    props.onSave(inputData, props?.measurementUnit?.id)
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

        {/* 50/50: Full name + Plural name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          </div>

          <div>
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
          </div>
        </div>

        {/* 33/33/33: Short name + Symbol + Notation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>
        </div>

        {/* Dimension dropdown */}
        {/* <Label
          name="dimension"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Dimension
        </Label>
        <SelectField
          name="dimension"
          defaultValue={props.measurementUnit?.dimension}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        >
          {DIMENSION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <FieldError name="dimension" className="rw-field-error" /> */}

        {/* Description textarea */}
        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>
        <TextAreaField
          name="description"
          defaultValue={props.measurementUnit?.description}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          rows={4}
        />
        <FieldError name="description" className="rw-field-error" />

        {/* 50/50: Conversion factor + Base unit */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          </div>

          <div>
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
          </div>
        </div> */}

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
