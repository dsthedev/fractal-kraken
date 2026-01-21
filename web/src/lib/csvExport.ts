export const generateCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return

  // Flatten nested objects into a single-level object with dot notation keys
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        if (
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          Object.assign(flattened, flattenObject(value, newKey))
        } else {
          flattened[newKey] = value
        }
      }
    }
    return flattened
  }

  // Escape CSV field values properly (escape quotes by doubling them)
  // Always quote description fields to avoid breaking CSVs
  const escapeCSVField = (header: string, value: any): string => {
    if (value === null || value === undefined) return ''
    const strValue = String(value)
    const needsQuoting =
      header.toLowerCase().endsWith('description') ||
      header.toLowerCase().includes('.description') ||
      strValue.includes(',') ||
      strValue.includes('"') ||
      strValue.includes('\n')

    if (needsQuoting) {
      return `"${strValue.replace(/"/g, '""')}"`
    }
    return strValue
  }

  // Flatten all rows
  const flatData = data.map((row) => flattenObject(row))

  // Extract all unique headers from all rows
  const headersSet = new Set<string>()
  flatData.forEach((row) => {
    Object.keys(row).forEach((key) => headersSet.add(key))
  })
  const headers = Array.from(headersSet).sort()

  // Build CSV
  const csv = [
    headers.map((h) => escapeCSVField(h, h)).join(','),
    ...flatData.map((row) =>
      headers.map((h) => escapeCSVField(h, row[h] ?? '')).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
