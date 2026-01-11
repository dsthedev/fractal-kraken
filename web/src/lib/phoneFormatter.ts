import type React from 'react'

/**
 * Formats a phone number string to US format (XXX) XXX-XXXX
 * Accepts numeric input only and removes any non-digit characters
 * @param value The raw phone input
 * @returns Formatted phone number or empty string if invalid
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return ''

  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '')

  // If less than 3 digits, return as is
  if (cleaned.length < 3) return cleaned

  // If between 3 and 6 digits, format as (XXX) XXX
  if (cleaned.length < 7) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  }

  // Otherwise format as (XXX) XXX-XXXX (truncate to 10 digits)
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}

/**
 * Extracts only digits from a phone number string
 * @param value The phone input (possibly formatted)
 * @returns Only the digits
 */
export const getPhoneDigits = (value: string): string => {
  return value?.replace(/\D/g, '') ?? ''
}

/**
 * Applies phone formatting on paste events to keep input normalized.
 */
export const applyPhonePaste = (
  event: React.ClipboardEvent<HTMLInputElement>
): void => {
  const pastedText = event.clipboardData.getData('text') ?? ''
  const formatted = formatPhoneNumber(pastedText)

  // Stop the raw paste and replace with formatted value
  event.preventDefault()

  const target = event.currentTarget

  // Update the DOM value so form libraries reading from the input see it
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set
  valueSetter?.call(target, formatted)

  // Fire both input and change events so React/React Hook Form pick it up
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
}
