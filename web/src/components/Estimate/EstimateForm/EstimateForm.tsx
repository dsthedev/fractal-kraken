import type { EditEstimateById, UpdateEstimateInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  RadioField,
  NumberField,
  Submit,
} from '@cedarjs/forms'

type FormEstimate = NonNullable<EditEstimateById['estimate']>

interface EstimateFormProps {
  estimate?: EditEstimateById['estimate']
  onSave: (data: UpdateEstimateInput, id?: FormEstimate['id']) => void
  error: RWGqlError
  loading: boolean
}

const EstimateForm = (props: EstimateFormProps) => {
  const onSubmit = (data: FormEstimate) => {
    props.onSave(data, props?.estimate?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormEstimate> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="uuid"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Uuid
        </Label>

        <TextField
          name="uuid"
          defaultValue={props.estimate?.uuid}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="uuid" className="rw-field-error" />

        <Label
          name="title"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Title
        </Label>

        <TextField
          name="title"
          defaultValue={props.estimate?.title}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="title" className="rw-field-error" />

        <Label
          name="status"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Status
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="estimate-status-0"
            name="status"
            defaultValue="DRAFT"
            defaultChecked={props.estimate?.status?.includes('DRAFT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Draft</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="estimate-status-1"
            name="status"
            defaultValue="SENT"
            defaultChecked={props.estimate?.status?.includes('SENT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Sent</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="estimate-status-2"
            name="status"
            defaultValue="ACCEPTED"
            defaultChecked={props.estimate?.status?.includes('ACCEPTED')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Accepted</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="estimate-status-3"
            name="status"
            defaultValue="REJECTED"
            defaultChecked={props.estimate?.status?.includes('REJECTED')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Rejected</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="estimate-status-4"
            name="status"
            defaultValue="EXPIRED"
            defaultChecked={props.estimate?.status?.includes('EXPIRED')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Expired</div>
        </div>

        <FieldError name="status" className="rw-field-error" />

        <Label
          name="installerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Installer entity id
        </Label>

        <NumberField
          name="installerEntityId"
          defaultValue={props.estimate?.installerEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="installerEntityId" className="rw-field-error" />

        <Label
          name="clientEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Client entity id
        </Label>

        <NumberField
          name="clientEntityId"
          defaultValue={props.estimate?.clientEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="clientEntityId" className="rw-field-error" />

        <Label
          name="retailerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Retailer entity id
        </Label>

        <NumberField
          name="retailerEntityId"
          defaultValue={props.estimate?.retailerEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="retailerEntityId" className="rw-field-error" />

        <Label
          name="jobAddressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job address line1
        </Label>

        <TextField
          name="jobAddressLine1"
          defaultValue={props.estimate?.jobAddressLine1}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobAddressLine1" className="rw-field-error" />

        <Label
          name="jobAddressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job address line2
        </Label>

        <TextField
          name="jobAddressLine2"
          defaultValue={props.estimate?.jobAddressLine2}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobAddressLine2" className="rw-field-error" />

        <Label
          name="jobCity"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job city
        </Label>

        <TextField
          name="jobCity"
          defaultValue={props.estimate?.jobCity}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobCity" className="rw-field-error" />

        <Label
          name="jobState"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job state
        </Label>

        <TextField
          name="jobState"
          defaultValue={props.estimate?.jobState}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobState" className="rw-field-error" />

        <Label
          name="jobPostalCode"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job postal code
        </Label>

        <TextField
          name="jobPostalCode"
          defaultValue={props.estimate?.jobPostalCode}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobPostalCode" className="rw-field-error" />

        <Label
          name="jobCountry"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job country
        </Label>

        <TextField
          name="jobCountry"
          defaultValue={props.estimate?.jobCountry}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobCountry" className="rw-field-error" />

        <Label
          name="subtotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Subtotal
        </Label>

        <TextField
          name="subtotal"
          defaultValue={props.estimate?.subtotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="subtotal" className="rw-field-error" />

        <Label
          name="taxTotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Tax total
        </Label>

        <TextField
          name="taxTotal"
          defaultValue={props.estimate?.taxTotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="taxTotal" className="rw-field-error" />

        <Label
          name="total"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total
        </Label>

        <TextField
          name="total"
          defaultValue={props.estimate?.total}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="total" className="rw-field-error" />

        <Label
          name="estimatedMinutesTotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estimated minutes total
        </Label>

        <NumberField
          name="estimatedMinutesTotal"
          defaultValue={props.estimate?.estimatedMinutesTotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="estimatedMinutesTotal" className="rw-field-error" />

        <Label
          name="authorId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Author id
        </Label>

        <TextField
          name="authorId"
          defaultValue={props.estimate?.authorId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="authorId" className="rw-field-error" />

        <Label
          name="notes"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notes
        </Label>

        <TextField
          name="notes"
          defaultValue={props.estimate?.notes}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="notes" className="rw-field-error" />

        <Label
          name="entityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Entity id
        </Label>

        <NumberField
          name="entityId"
          defaultValue={props.estimate?.entityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="entityId" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EstimateForm
