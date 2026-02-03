import { zodResolver } from '@hookform/resolvers/zod'
import type { EditEntityById, UpdateEntityInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import { Form, FormError, Submit, useFormContext } from '@cedarjs/forms'

import EntityFields, {
  entityValidationSchema,
  type EntityFormValues,
} from 'src/components/Entity/EntityForm/EntityFields'

interface EntityFormProps {
  entity?: EditEntityById['entity']
  onSave: (data: UpdateEntityInput, id?: EditEntityById['entity']['id']) => void
  error: RWGqlError
  loading: boolean
  initialValues?: Partial<UpdateEntityInput>
}

// Wrapper component to watch form values and pass to EntityFields
const EntityFieldsWithWatch = ({ initialValues }: { initialValues: Partial<EntityFormValues> }) => {
  const { watch } = useFormContext<EntityFormValues>()
  const isBusiness = watch('isBusiness')
  const usesNickname = watch('usesNickname')

  return (
    <EntityFields
      initialValues={initialValues}
      isBusiness={isBusiness}
      usesNickname={usesNickname}
    />
  )
}

const EntityForm = (props: EntityFormProps) => {
  const initial = { ...props.entity, ...props.initialValues }

  const onSubmit = (data: EntityFormValues) => {
    props.onSave(data as UpdateEntityInput, props?.entity?.id)
  }

  return (
    <div
      className="rw-form-wrapper"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Form<EntityFormValues>
        onSubmit={onSubmit}
        error={props.error}
        config={{
          resolver: zodResolver(entityValidationSchema),
          defaultValues: initial,
        }}
      >
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <EntityFieldsWithWatch initialValues={initial} />

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
