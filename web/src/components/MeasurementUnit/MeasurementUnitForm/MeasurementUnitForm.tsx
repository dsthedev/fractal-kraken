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

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-0"
            name="dimension"
            defaultValue="LINEAR"
            defaultChecked={props.measurementUnit?.dimension?.includes(
              'LINEAR'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Linear</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-1"
            name="dimension"
            defaultValue="SQUARE"
            defaultChecked={props.measurementUnit?.dimension?.includes(
              'SQUARE'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Square</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-2"
            name="dimension"
            defaultValue="CUBIC"
            defaultChecked={props.measurementUnit?.dimension?.includes('CUBIC')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Cubic</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-3"
            name="dimension"
            defaultValue="VOLUME"
            defaultChecked={props.measurementUnit?.dimension?.includes(
              'VOLUME'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Volume</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-4"
            name="dimension"
            defaultValue="TEMPORAL"
            defaultChecked={props.measurementUnit?.dimension?.includes(
              'TEMPORAL'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Temporal</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-5"
            name="dimension"
            defaultValue="COUNT"
            defaultChecked={props.measurementUnit?.dimension?.includes('COUNT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Count</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-6"
            name="dimension"
            defaultValue="AREA"
            defaultChecked={props.measurementUnit?.dimension?.includes('AREA')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Area</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-dimension-7"
            name="dimension"
            defaultValue="CUSTOM"
            defaultChecked={props.measurementUnit?.dimension?.includes(
              'CUSTOM'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Custom</div>
        </div>

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
          name="category"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Category
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-0"
            name="category"
            defaultValue="LENGTH"
            defaultChecked={props.measurementUnit?.category?.includes('LENGTH')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Length</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-1"
            name="category"
            defaultValue="AREA"
            defaultChecked={props.measurementUnit?.category?.includes('AREA')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Area</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-2"
            name="category"
            defaultValue="VOLUME"
            defaultChecked={props.measurementUnit?.category?.includes('VOLUME')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Volume</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-3"
            name="category"
            defaultValue="TIME"
            defaultChecked={props.measurementUnit?.category?.includes('TIME')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Time</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-4"
            name="category"
            defaultValue="COUNT"
            defaultChecked={props.measurementUnit?.category?.includes('COUNT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Count</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="measurementUnit-category-5"
            name="category"
            defaultValue="CUSTOM"
            defaultChecked={props.measurementUnit?.category?.includes('CUSTOM')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Custom</div>
        </div>

        <FieldError name="category" className="rw-field-error" />

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
