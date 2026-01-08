import type { UpdateUserInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@cedarjs/forms'

type UserUpdateFormFields = {
  email: string
  name?: string
}

interface UserFormProps {
  user?: {
    id: string
    email: string
    name?: string
  }
  onSave: (data: UserUpdateFormFields, id?: string) => void
  error: RWGqlError
  loading: boolean
}

const UserForm = (props: UserFormProps) => {
  const onSubmit = (data: UserUpdateFormFields) => {
    props.onSave(data, props.user?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<UserUpdateFormFields> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Email Field */}
        <Label
          name="email"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Email
        </Label>
        <TextField
          name="email"
          defaultValue={props.user?.email}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="email" className="rw-field-error" />

        {/* Name Field */}
        <Label
          name="name"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Name
        </Label>
        <TextField
          name="name"
          defaultValue={props.user?.name}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="name" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default UserForm
