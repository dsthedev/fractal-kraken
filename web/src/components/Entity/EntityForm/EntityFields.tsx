import React from 'react'

import { z } from 'zod'

import { useFormContext } from '@cedarjs/forms'
import {
  CheckboxField,
  FieldError,
  Label,
  SelectField,
  TextAreaField,
  TextField,
} from '@cedarjs/forms'

import { applyPhonePaste, formatPhoneNumber } from 'src/lib/phoneFormatter'

export const entityValidationSchema = z.object({
  type: z.enum(['CONTRACTOR', 'CLIENT', 'RETAILER', 'INSTALLER', 'OTHER']),
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
  isBusiness: z.boolean().optional(),
  usesNickname: z.boolean().optional(),
})

export type EntityFormValues = z.infer<typeof entityValidationSchema>

interface EntityFieldsProps {
  initialValues?: Partial<EntityFormValues>
  includeType?: boolean
  showAddressLine2?: boolean
  showCountry?: boolean
  isBusiness?: boolean
  usesNickname?: boolean
}

const EntityFields = ({
  initialValues,
  includeType = true,
  showAddressLine2 = false,
  showCountry = false,
  isBusiness: controlledIsBusiness,
  usesNickname: controlledUsesNickname,
}: EntityFieldsProps) => {
  const form = useFormContext<EntityFormValues>()

  // Use controlled props if provided, otherwise watch form context, otherwise fall back to initial values
  const isBusiness =
    controlledIsBusiness ??
    form?.watch?.('isBusiness') ??
    initialValues?.isBusiness ??
    false
  const useDisplayName =
    controlledUsesNickname ??
    form?.watch?.('usesNickname') ??
    initialValues?.usesNickname ??
    false

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhoneNumber(e.target.value)
  }

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    applyPhonePaste(e)
  }

  return (
    <>
      {includeType ? (
        <>
          <Label
            name="type"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Type
          </Label>

          <SelectField
            name="type"
            defaultValue={initialValues?.type || 'CONTRACTOR'}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          >
            <option value="CONTRACTOR">Contractor</option>
            <option value="CLIENT">Client</option>
            <option value="RETAILER">Retailer</option>
            <option value="OTHER">Other</option>
          </SelectField>

          <FieldError name="type" className="rw-field-error" />
        </>
      ) : (
        <input
          name="type"
          type="hidden"
          defaultValue={initialValues?.type || 'CONTRACTOR'}
        />
      )}

      {/* Checkboxes for field visibility */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2">
          <CheckboxField name="isBusiness" className="h-4 w-4" />
          <label
            htmlFor="isBusiness"
            className="text-sm font-medium cursor-pointer"
          >
            This is a business
          </label>
        </div>

        <div className="flex items-center gap-2">
          <CheckboxField name="usesNickname" className="h-4 w-4" />
          <label
            htmlFor="usesNickname"
            className="text-sm font-medium cursor-pointer"
          >
            Use Display Name
          </label>
        </div>
      </div>

      {/* Name and Contact Name - responsive grid based on visible fields */}
      <div
        className={`grid gap-4 ${
          !useDisplayName && !isBusiness
            ? 'grid-cols-1'
            : useDisplayName && isBusiness
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        <div>
          <Label
            name="name"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            {isBusiness ? 'Company Name' : 'Name'}
          </Label>

          <TextField
            name="name"
            defaultValue={initialValues?.name}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <FieldError name="name" className="rw-field-error" />
        </div>

        {useDisplayName && (
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
              defaultValue={initialValues?.nickname}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="nickname" className="rw-field-error" />
          </div>
        )}

        {isBusiness && (
          <div>
            <Label
              name="contactName"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Contact Name
            </Label>

            <TextField
              name="contactName"
              defaultValue={initialValues?.contactName}
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="contactName" className="rw-field-error" />
          </div>
        )}
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
            defaultValue={initialValues?.email}
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
            defaultValue={initialValues?.phone}
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
          defaultValue={initialValues?.addressLine1}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          placeholder="Street address"
        />

        <FieldError name="addressLine1" className="rw-field-error" />
      </div>

      <div className={showAddressLine2 ? '' : 'hidden'}>
        <Label
          name="addressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Address line 2
        </Label>

        <TextField
          name="addressLine2"
          defaultValue={initialValues?.addressLine2}
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
            defaultValue={initialValues?.city}
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
            defaultValue={initialValues?.state}
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
            defaultValue={initialValues?.postalCode}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <FieldError name="postalCode" className="rw-field-error" />
        </div>
      </div>

      {showCountry && (
        <div>
          <Label
            name="country"
            className="rw-label"
            errorClassName="rw-label rw-label-error"
          >
            Country
          </Label>

          <TextField
            name="country"
            defaultValue={initialValues?.country}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            placeholder="US"
          />

          <FieldError name="country" className="rw-field-error" />
        </div>
      )}

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
          defaultValue={initialValues?.notes}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          rows={3}
        />

        <FieldError name="notes" className="rw-field-error" />
      </div>
    </>
  )
}

export default EntityFields
