// Helper function to get current week number (ISO 8601)
export const getWeekNumber = (date: Date): string => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return weekNum.toString()
}

// Helper to convert name to camelCase for compact references
// "Bob Dole" -> "BobDole", "ACME Corp" -> "AcmeCorp"
export const shortenNameToCamelCase = (name: string): string => {
  return name
    .split(/\s+/) // Split on whitespace
    .map((word) => {
      if (!word) return ''
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

// Create compact reference number in format: [weekNo-RetailerCamelCase-ClientCamelCase]
// Used primarily for invoice numbers
export const createRefNo = (
  retailerName: string | null | undefined,
  clientName: string | null | undefined
): string => {
  const weekNo = getWeekNumber(new Date())
  const retailer = retailerName
    ? shortenNameToCamelCase(retailerName)
    : 'RETAILER'
  const client = clientName ? shortenNameToCamelCase(clientName) : 'CLIENT'

  return `${weekNo}-${retailer}-${client}`
}

// Build full title in format: [weekNumber - RetailerName - ClientName]
// Used for estimate titles and display purposes
export const buildTitle = (
  weekNumber: string,
  retailerName?: string,
  clientName?: string
): string => {
  const parts = [weekNumber]
  if (retailerName) parts.push(retailerName)
  if (clientName) parts.push(clientName)
  return parts.join(' - ')
}
