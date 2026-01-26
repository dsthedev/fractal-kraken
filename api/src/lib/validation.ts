// Shared validation helpers for the API layer (keep in sync with web/src/lib/validation.ts)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmailValid = (email: string): boolean =>
  EMAIL_PATTERN.test(email)

export const assertEmailValid = (email: string): void => {
  if (!isEmailValid(email)) {
    throw new Error('Please enter a valid email address')
  }
}
