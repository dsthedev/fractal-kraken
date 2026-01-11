/**
 * Calculate subtotal from unit price and quantity
 * @param unitPrice - Price per unit
 * @param quantity - Number of units
 * @returns Formatted currency string (e.g., "123.45")
 */
export const calculateSubtotal = (
  unitPrice: number,
  quantity: number
): string => {
  const subtotal = unitPrice * quantity
  return subtotal.toFixed(2)
}

/**
 * Calculate estimated hours from minutes per unit and quantity
 * @param minutesPerUnit - Estimated minutes per unit
 * @param quantity - Number of units
 * @returns Formatted hours string (e.g., "~8.33 hrs (1.0 days)")
 */
export const calculateEstimatedHours = (
  minutesPerUnit: number,
  quantity: number
): string => {
  const totalMinutes = minutesPerUnit * quantity
  const hours = totalMinutes / 60

  // Add days in parenthesis if more than 8 hours (assuming 8-hour workday)
  if (hours > 8) {
    const days = hours / 8
    return `~${hours.toFixed(2)} hrs (${days.toFixed(1)} days)`
  }

  return `~${hours.toFixed(2)} hrs`
}

/**
 * Calculate hourly rate from subtotal and total hours
 * @param subtotal - Total cost
 * @param minutesPerUnit - Estimated minutes per unit
 * @param quantity - Number of units
 * @returns Formatted hourly rate string (e.g., "~$25.50/hr")
 */
export const calculateHourlyRate = (
  subtotal: number,
  minutesPerUnit: number,
  quantity: number
): string => {
  if (minutesPerUnit <= 0 || quantity <= 0) {
    return '~$0.00/hr'
  }
  const totalMinutes = minutesPerUnit * quantity
  const totalHours = totalMinutes / 60
  const hourlyRate = subtotal / totalHours
  return `~$${hourlyRate.toFixed(2)}/hr`
}
