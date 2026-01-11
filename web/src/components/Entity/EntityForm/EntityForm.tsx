import type { EditEntityById, UpdateEntityInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  RadioField,
  TextField,
  Submit,
} from '@cedarjs/forms'

type FormEntity = NonNullable<EditEntityById['entity']>

interface EntityFormProps {
  entity?: EditEntityById['entity']
  onSave: (data: UpdateEntityInput, id?: FormEntity['id']) => void
  error: RWGqlError
  loading: boolean
}

const EntityForm = (props: EntityFormProps) => {
  const onSubmit = (data: FormEntity) => {
    props.onSave(data, props?.entity?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormEntity> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="type"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Type
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-0"
            name="type"
            defaultValue="CONTRACTOR"
            defaultChecked={props.entity?.type?.includes('CONTRACTOR')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Contractor</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-1"
            name="type"
            defaultValue="INSTALLER"
            defaultChecked={props.entity?.type?.includes('INSTALLER')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Installer</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-2"
            name="type"
            defaultValue="CLIENT"
            defaultChecked={props.entity?.type?.includes('CLIENT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Client</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-3"
            name="type"
            defaultValue="RETAILER"
            defaultChecked={props.entity?.type?.includes('RETAILER')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Retailer</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-4"
            name="type"
            defaultValue="SUPPLIER"
            defaultChecked={props.entity?.type?.includes('SUPPLIER')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Supplier</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-5"
            name="type"
            defaultValue="COMPANY"
            defaultChecked={props.entity?.type?.includes('COMPANY')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Company</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-6"
            name="type"
            defaultValue="INDIVIDUAL"
            defaultChecked={props.entity?.type?.includes('INDIVIDUAL')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Individual</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="entity-type-7"
            name="type"
            defaultValue="OTHER"
            defaultChecked={props.entity?.type?.includes('OTHER')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Other</div>
        </div>

        <FieldError name="type" className="rw-field-error" />

        <Label
          name="name"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Name
        </Label>

        <TextField
          name="name"
          defaultValue={props.entity?.name}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="name" className="rw-field-error" />

        <Label
          name="contactName"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Contact name
        </Label>

        <TextField
          name="contactName"
          defaultValue={props.entity?.contactName}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="contactName" className="rw-field-error" />

        <Label
          name="email"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Email
        </Label>

        <TextField
          name="email"
          defaultValue={props.entity?.email}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="email" className="rw-field-error" />

        <Label
          name="phone"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Phone
        </Label>

        <TextField
          name="phone"
          defaultValue={props.entity?.phone}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="phone" className="rw-field-error" />

        <Label
          name="addressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Address line1
        </Label>

        <TextField
          name="addressLine1"
          defaultValue={props.entity?.addressLine1}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="addressLine1" className="rw-field-error" />

        <Label
          name="addressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Address line2
        </Label>

        <TextField
          name="addressLine2"
          defaultValue={props.entity?.addressLine2}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="addressLine2" className="rw-field-error" />

        <Label
          name="city"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          City
        </Label>

        <TextField
          name="city"
          defaultValue={props.entity?.city}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="city" className="rw-field-error" />

        <Label
          name="state"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          State
        </Label>

        <TextField
          name="state"
          defaultValue={props.entity?.state}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="state" className="rw-field-error" />

        <Label
          name="postalCode"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Postal code
        </Label>

        <TextField
          name="postalCode"
          defaultValue={props.entity?.postalCode}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="postalCode" className="rw-field-error" />

        <Label
          name="country"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Country
        </Label>

        <TextField
          name="country"
          defaultValue={props.entity?.country}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="country" className="rw-field-error" />

        <Label
          name="notes"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notes
        </Label>

        <TextField
          name="notes"
          defaultValue={props.entity?.notes}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="notes" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EntityForm
