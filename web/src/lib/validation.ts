/**
 * Email format validation pattern
 * Matches standard email format: user@domain.extension
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if valid, error message if invalid
 */
export const validateEmail = (email: string): boolean | string => {
  if (!email) return true // Allow empty (required validation handled separately)
  if (!EMAIL_PATTERN.test(email)) {
    return 'Please enter a valid email address'
  }
  return true
}

/**
 * Email validation rules for React Hook Form
 * Can be spread into the validation prop: validation={{ ...EMAIL_VALIDATION }}
 */
export const EMAIL_VALIDATION = {
  required: true,
  validate: validateEmail,
}
