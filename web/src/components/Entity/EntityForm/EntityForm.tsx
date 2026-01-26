import type { EditEntityById, UpdateEntityInput } from 'types/graphql'
import { z } from 'zod'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  TextField,
  TextAreaField,
  Submit,
} from '@cedarjs/forms'

import { applyPhonePaste, formatPhoneNumber } from 'src/lib/phoneFormatter'

type FormEntity = NonNullable<EditEntityById['entity']>

const entityValidationSchema = z.object({
  type: z.string(),
  name: z.string().min(1, 'Name is required'),
  nickname: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  authorId: z.string().optional(),
})

interface EntityFormProps {
  entity?: EditEntityById['entity']
  onSave: (data: UpdateEntityInput, id?: FormEntity['id']) => void
  error: RWGqlError
  loading: boolean
  initialValues?: Partial<UpdateEntityInput>
}

const EntityForm = (props: EntityFormProps) => {
  const initial = { ...props.entity, ...props.initialValues }

  const onSubmit = (data: FormEntity) => {
    // Exclude id, timestamps, and authorId from the submission data
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      authorId: _authorId,
      author: _author,
      usersDefault: _usersDefault,
      usersRetailer: _usersRetailer,
      ...inputData
    } = data
    props.onSave(inputData, props?.entity?.id)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhoneNumber(e.target.value)
  }

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    applyPhonePaste(e)
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

        <SelectField
          name="type"
          defaultValue={initial.type || 'CONTRACTOR'}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: 'Type is required' }}
        >
          <option value="CONTRACTOR">Contractor</option>
          <option value="CLIENT">Client</option>
          <option value="RETAILER">Retailer</option>
          <option value="OTHER">Other</option>
        </SelectField>

        <FieldError name="type" className="rw-field-error" />

        {/* Name and Contact Name - 50/50 row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label
              name="name"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Company
            </Label>

            <TextField
              name="name"
              defaultValue={initial.name}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />

            <FieldError name="name" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="nickname"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Display Name
            </Label>

            <TextField
              name="nickname"
              defaultValue={initial.nickname}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              validation={{ required: false }}
            />

            <FieldError name="name" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="contactName"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Contact
            </Label>

            <TextField
              name="contactName"
              defaultValue={initial.contactName}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="contactName" className="rw-field-error" />
          </div>
        </div>

        {/* Email and Phone - 50/50 row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label
              name="email"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Email
            </Label>

            <TextField
              name="email"
              defaultValue={initial.email}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="email" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="phone"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Phone
            </Label>

            <TextField
              name="phone"
              defaultValue={initial.phone}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              onChange={handlePhoneChange}
              onPaste={handlePhonePaste}
              placeholder="(XXX) XXX-XXXX"
            />

            <FieldError name="phone" className="rw-field-error" />
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <Label
            name="addressLine1"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Address line 1
          </Label>

          <TextField
            name="addressLine1"
            defaultValue={initial.addressLine1}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            placeholder="Street address"
          />

          <FieldError name="addressLine1" className="rw-field-error" />
        </div>

        <div className="hidden">
          <Label
            name="addressLine2"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Address line 2
          </Label>

          <TextField
            name="addressLine2"
            defaultValue={initial.addressLine2}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            placeholder="Apartment, suite, etc."
          />

          <FieldError name="addressLine2" className="rw-field-error" />
        </div>

        {/* City, State, Postal Code - Medium and up layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label
              name="city"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              City
            </Label>

            <TextField
              name="city"
              defaultValue={initial.city}
              placeholder=""
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="city" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="state"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              State
            </Label>

            <TextField
              name="state"
              defaultValue={initial.state}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              placeholder="WI"
            />

            <FieldError name="state" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="postalCode"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Postal code
            </Label>

            <TextField
              name="postalCode"
              defaultValue={initial.postalCode}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="postalCode" className="rw-field-error" />
          </div>
        </div>

        {/* Country */}
        {/* <div>
          <Label
            name="country"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Country
          </Label>

          <TextField
            name="country"
            defaultValue={initial.country}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            placeholder="US"
          />

          <FieldError name="country" className="rw-field-error" />
        </div> */}

        {/* Notes */}
        <div>
          <Label
            name="notes"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Notes
          </Label>

          <TextAreaField
            name="notes"
            defaultValue={initial.notes}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            rows={3}
          />

          <FieldError name="notes" className="rw-field-error" />
        </div>

        {/* Hidden readonly authorId field for existing entities */}
        {props.entity?.authorId && (
          <input type="hidden" name="authorId" value={props.entity.authorId} />
        )}

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
