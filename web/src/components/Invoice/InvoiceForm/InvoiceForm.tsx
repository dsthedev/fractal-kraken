import type { EditInvoiceByUuid, UpdateInvoiceInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  RadioField,
  DatetimeLocalField,
  NumberField,
  Submit,
} from '@cedarjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

type FormInvoice = NonNullable<EditInvoiceByUuid['invoice']>

interface InvoiceFormProps {
  invoice?: EditInvoiceByUuid['invoice']
  onSave: (data: UpdateInvoiceInput, uuid?: FormInvoice['uuid']) => void
  error: RWGqlError
  loading: boolean
}

const InvoiceForm = (props: InvoiceFormProps) => {
  const onSubmit = (data: FormInvoice) => {
    props.onSave(data, props?.invoice?.uuid)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormInvoice> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="authorId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Author id
        </Label>

        <TextField
          name="authorId"
          defaultValue={props.invoice?.authorId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="authorId" className="rw-field-error" />

        <Label
          name="invoiceNumber"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Invoice number
        </Label>

        <TextField
          name="invoiceNumber"
          defaultValue={props.invoice?.invoiceNumber}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="invoiceNumber" className="rw-field-error" />

        <Label
          name="status"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Status
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-status-0"
            name="status"
            defaultValue="DRAFT"
            defaultChecked={props.invoice?.status?.includes('DRAFT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Draft</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-status-1"
            name="status"
            defaultValue="SENT"
            defaultChecked={props.invoice?.status?.includes('SENT')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Sent</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-status-2"
            name="status"
            defaultValue="ARCHIVED"
            defaultChecked={props.invoice?.status?.includes('ARCHIVED')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Archived</div>
        </div>

        <FieldError name="status" className="rw-field-error" />

        <Label
          name="payStatus"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Pay status
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-payStatus-0"
            name="payStatus"
            defaultValue="UNPAID"
            defaultChecked={props.invoice?.payStatus?.includes('UNPAID')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Unpaid</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-payStatus-1"
            name="payStatus"
            defaultValue="OUTSTANDING"
            defaultChecked={props.invoice?.payStatus?.includes('OUTSTANDING')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Outstanding</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            uuid="invoice-payStatus-2"
            name="payStatus"
            defaultValue="PAID"
            defaultChecked={props.invoice?.payStatus?.includes('PAID')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Paid</div>
        </div>

        <FieldError name="payStatus" className="rw-field-error" />

        <Label
          name="jobStartedAt"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job started at
        </Label>

        <DatetimeLocalField
          name="jobStartedAt"
          defaultValue={formatDatetime(props.invoice?.jobStartedAt)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobStartedAt" className="rw-field-error" />

        <Label
          name="jobFinishedAt"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job finished at
        </Label>

        <DatetimeLocalField
          name="jobFinishedAt"
          defaultValue={formatDatetime(props.invoice?.jobFinishedAt)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobFinishedAt" className="rw-field-error" />

        <Label
          name="dueAt"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Due at
        </Label>

        <DatetimeLocalField
          name="dueAt"
          defaultValue={formatDatetime(props.invoice?.dueAt)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="dueAt" className="rw-field-error" />

        <Label
          name="paidAt"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Paid at
        </Label>

        <DatetimeLocalField
          name="paidAt"
          defaultValue={formatDatetime(props.invoice?.paidAt)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="paidAt" className="rw-field-error" />

        <Label
          name="payorEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor entity id
        </Label>

        <NumberField
          name="payorEntityId"
          defaultValue={props.invoice?.payorEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="payorEntityId" className="rw-field-error" />

        <Label
          name="payeeEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee entity id
        </Label>

        <NumberField
          name="payeeEntityId"
          defaultValue={props.invoice?.payeeEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="payeeEntityId" className="rw-field-error" />

        <Label
          name="sourceEstimateId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Source estimate id
        </Label>

        <NumberField
          name="sourceEstimateId"
          defaultValue={props.invoice?.sourceEstimateId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="sourceEstimateId" className="rw-field-error" />

        <Label
          name="sourceInstallerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Source installer entity id
        </Label>

        <NumberField
          name="sourceInstallerEntityId"
          defaultValue={props.invoice?.sourceInstallerEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="sourceInstallerEntityId" className="rw-field-error" />

        <Label
          name="sourceClientEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Source client entity id
        </Label>

        <NumberField
          name="sourceClientEntityId"
          defaultValue={props.invoice?.sourceClientEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="sourceClientEntityId" className="rw-field-error" />

        <Label
          name="sourceRetailerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Source retailer entity id
        </Label>

        <NumberField
          name="sourceRetailerEntityId"
          defaultValue={props.invoice?.sourceRetailerEntityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="sourceRetailerEntityId" className="rw-field-error" />

        <Label
          name="payeeAddressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee address line1
        </Label>

        <TextField
          name="payeeAddressLine1"
          defaultValue={props.invoice?.payeeAddressLine1}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeeAddressLine1" className="rw-field-error" />

        <Label
          name="payeeAddressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee address line2
        </Label>

        <TextField
          name="payeeAddressLine2"
          defaultValue={props.invoice?.payeeAddressLine2}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeeAddressLine2" className="rw-field-error" />

        <Label
          name="payeeCity"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee city
        </Label>

        <TextField
          name="payeeCity"
          defaultValue={props.invoice?.payeeCity}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeeCity" className="rw-field-error" />

        <Label
          name="payeeState"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee state
        </Label>

        <TextField
          name="payeeState"
          defaultValue={props.invoice?.payeeState}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeeState" className="rw-field-error" />

        <Label
          name="payeePostalCode"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee postal code
        </Label>

        <TextField
          name="payeePostalCode"
          defaultValue={props.invoice?.payeePostalCode}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeePostalCode" className="rw-field-error" />

        <Label
          name="payeeCountry"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payee country
        </Label>

        <TextField
          name="payeeCountry"
          defaultValue={props.invoice?.payeeCountry}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payeeCountry" className="rw-field-error" />

        <Label
          name="payorAddressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor address line1
        </Label>

        <TextField
          name="payorAddressLine1"
          defaultValue={props.invoice?.payorAddressLine1}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorAddressLine1" className="rw-field-error" />

        <Label
          name="payorAddressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor address line2
        </Label>

        <TextField
          name="payorAddressLine2"
          defaultValue={props.invoice?.payorAddressLine2}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorAddressLine2" className="rw-field-error" />

        <Label
          name="payorCity"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor city
        </Label>

        <TextField
          name="payorCity"
          defaultValue={props.invoice?.payorCity}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorCity" className="rw-field-error" />

        <Label
          name="payorState"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor state
        </Label>

        <TextField
          name="payorState"
          defaultValue={props.invoice?.payorState}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorState" className="rw-field-error" />

        <Label
          name="payorPostalCode"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor postal code
        </Label>

        <TextField
          name="payorPostalCode"
          defaultValue={props.invoice?.payorPostalCode}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorPostalCode" className="rw-field-error" />

        <Label
          name="payorCountry"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Payor country
        </Label>

        <TextField
          name="payorCountry"
          defaultValue={props.invoice?.payorCountry}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="payorCountry" className="rw-field-error" />

        <Label
          name="jobAddressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job address line1
        </Label>

        <TextField
          name="jobAddressLine1"
          defaultValue={props.invoice?.jobAddressLine1}
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
          defaultValue={props.invoice?.jobAddressLine2}
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
          defaultValue={props.invoice?.jobCity}
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
          defaultValue={props.invoice?.jobState}
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
          defaultValue={props.invoice?.jobPostalCode}
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
          defaultValue={props.invoice?.jobCountry}
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
          defaultValue={props.invoice?.subtotal}
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
          defaultValue={props.invoice?.taxTotal}
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
          defaultValue={props.invoice?.total}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="total" className="rw-field-error" />

        <Label
          name="notes"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notes
        </Label>

        <TextField
          name="notes"
          defaultValue={props.invoice?.notes}
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
          defaultValue={props.invoice?.entityId}
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

export default InvoiceForm
