import type { EditServiceById, UpdateServiceInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  SelectField,
  TextAreaField,
  Submit,
} from '@cedarjs/forms'

const ACTION_OPTIONS = [
  { value: 'INSTALL', label: 'Install' },
  { value: 'REMOVE', label: 'Remove' },
  { value: 'REPLACE', label: 'Replace' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'FINISH', label: 'Finish' },
  { value: 'PREPARE', label: 'Prepare' },
  { value: 'CLEAN', label: 'Clean' },
  { value: 'MOVE', label: 'Move' },
  { value: 'INSPECT', label: 'Inspect' },
  { value: 'CUSTOM', label: 'Custom' },
] as const

type FormService = NonNullable<EditServiceById['service']>

interface ServiceFormProps {
  service?: EditServiceById['service']
  onSave: (data: UpdateServiceInput, id?: FormService['id']) => void
  error: RWGqlError
  loading: boolean
}

const ServiceForm = (props: ServiceFormProps) => {
  const onSubmit = (data: FormService) => {
    props.onSave(data, props?.service?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormService> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Three-column layout for action, material, and context on medium+ screens */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Label
              name="action"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Action
            </Label>
            <SelectField
              name="action"
              defaultValue={props.service?.action || ''}
              className="rw-input"
              validation={{ required: true }}
              errorClassName="rw-input rw-input-error"
            >
              <option value="">Select an action...</option>
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <FieldError name="action" className="rw-field-error" />
          </div>

          <div className="flex-1">
            <Label
              name="material"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Material
            </Label>
            <TextField
              name="material"
              defaultValue={props.service?.material}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError name="material" className="rw-field-error" />
          </div>

          <div className="flex-1">
            <Label
              name="context"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Context
            </Label>
            <TextField
              name="context"
              defaultValue={props.service?.context}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />
            <FieldError name="context" className="rw-field-error" />
          </div>
        </div>

        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>
        <TextAreaField
          name="description"
          defaultValue={props.service?.description || ''}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          rows={4}
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

export default ServiceForm
