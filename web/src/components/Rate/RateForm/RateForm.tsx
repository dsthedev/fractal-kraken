import type { EditRateById, UpdateRateInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  Submit,
} from '@cedarjs/forms'

type FormRate = NonNullable<EditRateById['rate']>

interface RateFormProps {
  rate?: EditRateById['rate']
  onSave: (data: UpdateRateInput, id?: FormRate['id']) => void
  error: RWGqlError
  loading: boolean
}

const RateForm = (props: RateFormProps) => {
  const onSubmit = (data: FormRate) => {
    props.onSave(data, props?.rate?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormRate> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="serviceId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Service id
        </Label>

        <NumberField
          name="serviceId"
          defaultValue={props.rate?.serviceId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="serviceId" className="rw-field-error" />

        <Label
          name="unitId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Unit id
        </Label>

        <NumberField
          name="unitId"
          defaultValue={props.rate?.unitId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="unitId" className="rw-field-error" />

        <Label
          name="subAmount"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Sub amount
        </Label>

        <TextField
          name="subAmount"
          defaultValue={props.rate?.subAmount}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="subAmount" className="rw-field-error" />

        <Label
          name="retailAmount"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Retail amount
        </Label>

        <TextField
          name="retailAmount"
          defaultValue={props.rate?.retailAmount}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="retailAmount" className="rw-field-error" />

        <Label
          name="currency"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Currency
        </Label>

        <TextField
          name="currency"
          defaultValue={props.rate?.currency}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="currency" className="rw-field-error" />

        <Label
          name="authorId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Author id
        </Label>

        <TextField
          name="authorId"
          defaultValue={props.rate?.authorId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="authorId" className="rw-field-error" />

        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>

        <TextField
          name="description"
          defaultValue={props.rate?.description}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="description" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default RateForm
