export type SortDirection = 'asc' | 'desc'

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc: any, key: string) => {
    if (acc === null || acc === undefined) return undefined
    return acc[key]
  }, obj)
}

export function sortByField<T>(
  items: T[],
  key: string,
  direction: SortDirection = 'asc'
) {
  const parseNumeric = (v: any) => {
    if (typeof v === 'number') return v
    if (typeof v !== 'string') return Number.NaN
    // strip out currency symbols, whitespace, and thousands separators
    const cleaned = v.replace(/[^0-9.\-]+/g, '')
    const num = parseFloat(cleaned.replace(/,/g, ''))
    return Number.isFinite(num) ? num : Number.NaN
  }

  const sorted = [...items].sort((a: any, b: any) => {
    const aValue = getNestedValue(a, key)
    const bValue = getNestedValue(b, key)

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Numeric comparison for numbers and numeric-looking strings
    const aNum = parseNumeric(aValue)
    const bNum = parseNumeric(bValue)
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      if (aNum < bNum) return direction === 'asc' ? -1 : 1
      if (aNum > bNum) return direction === 'asc' ? 1 : -1
      return 0
    }

    // Date objects
    if (aValue instanceof Date && bValue instanceof Date) {
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    }

    // String comparison (case-insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue
        .toLowerCase()
        .localeCompare(bValue.toLowerCase())
      return direction === 'asc' ? comparison : -comparison
    }

    // Fallback comparison
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  return sorted
}

export const toggleSort = (
  current: { key: string; direction: SortDirection },
  clickedKey: string
): { key: string; direction: SortDirection } => {
  if (current.key === clickedKey) {
    if (current.direction === 'asc')
      return { key: clickedKey, direction: 'desc' }
    // reset to default (id asc) when clicking third time
    return { key: 'id', direction: 'asc' }
  }
  return { key: clickedKey, direction: 'asc' }
}
