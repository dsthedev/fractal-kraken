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
    headers.join(','),
    ...flatData.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
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
