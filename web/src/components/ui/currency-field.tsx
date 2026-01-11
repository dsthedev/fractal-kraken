import React from 'react'

import { useController } from 'react-hook-form'

import { Label, FieldError, useFormContext } from '@cedarjs/forms'

interface CurrencyFieldProps {
  name: string
  label?: string
  defaultValue?: number | string
  required?: boolean
  readOnly?: boolean
  className?: string
}

/**
 * Currency input that accepts dollars (e.g., "20.00" or "20")
 * and stores as Decimal in the form state.
 * Automatically formats display with $ prefix.
 */
export const CurrencyField = ({
  name,
  label,
  defaultValue,
  required = false,
  readOnly = false,
  className = '',
}: CurrencyFieldProps) => {
  const { control } = useFormContext()
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: defaultValue ?? '',
    rules: {
      required: required ? 'Required' : false,
      validate: (value) => {
        if (!value && !required) return true
        const num = parseFloat(String(value).replace(/[$,]/g, ''))
        if (isNaN(num)) return 'Invalid amount'
        if (num < 0) return 'Cannot be negative'
        return true
      },
    },
  })

  const [displayValue, setDisplayValue] = React.useState(() => {
    if (!field.value) return ''
    const num = parseFloat(String(field.value))
    return isNaN(num) ? '' : num.toFixed(2)
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[$,]/g, '')

    // Only allow numbers and one decimal point
    raw = raw.replace(/[^0-9.]/g, '')

    // Only allow one decimal point
    const parts = raw.split('.')
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      raw = parts[0] + '.' + parts[1].slice(0, 2)
    }

    setDisplayValue(raw)

    // Only update form value if it's a valid number
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      field.onChange(num)
    } else if (raw === '') {
      field.onChange('')
    }
  }

  const handleBlur = () => {
    field.onBlur()
    // Format on blur
    const num = parseFloat(displayValue)
    if (!isNaN(num)) {
      setDisplayValue(num.toFixed(2))
    }
  }

  return (
    <div>
      <Label
        name={name}
        htmlFor={name}
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        {label ?? name}
      </Label>
      <div className="relative">
        <span className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 rounded-l text-gray-600 dark:text-gray-400 font-medium">
          $
        </span>
        <input
          {...field}
          id={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          readOnly={readOnly}
          className={`w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${
            readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
          } ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
      </div>
      <FieldError name={name} className="rw-field-error" />
    </div>
  )
}
