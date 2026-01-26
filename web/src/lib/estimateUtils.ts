import type { BillableItem, Entity } from 'types/graphql'
import type { FindRates } from 'types/graphql'

/**
 * Format a number as money string with 2 decimal places
 */
export const formatMoney = (value?: number | null): string => {
  return Number(value ?? 0).toFixed(2)
}

/**
 * Build a service label from a billable item's action and material
 */
export const serviceLabel = (item: BillableItem): string => {
  const base = [item.action?.name, item.material?.name]
    .filter(Boolean)
    .join(' ')
  return base || '—'
}

/**
 * Build a display label for a rate (used in combobox)
 */
export const buildRateLabel = (
  rate: FindRates['rates'][0],
  pricingType: 'sub' | 'retail'
): string => {
  const serviceDisplay = [rate.action?.name, rate.material?.name]
    .filter(Boolean)
    .join(' ')
  const context = rate.context ? ` (${rate.context})` : ''
  const amount = pricingType === 'sub' ? rate.subAmount : rate.retailAmount
  return `${serviceDisplay}${context} - ${rate.unit?.fullName} - $${Number(amount).toFixed(2)}`
}

/**
 * Build a searchable string for a rate (used in combobox filtering)
 */
export const buildRateSearchValue = (rate: FindRates['rates'][0]): string => {
  return [
    rate.action?.name,
    rate.material?.name,
    rate.context,
    rate.unit?.shortName,
    rate.unit?.fullName,
    rate.currency,
    String(rate.subAmount ?? ''),
    String(rate.retailAmount ?? ''),
    String(rate.id ?? ''),
    String(rate.actionId ?? ''),
    String(rate.materialId ?? ''),
    String(rate.unitId ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Build an entity update input from entity fields
 * Reduces boilerplate by extracting common update logic
 */
export const buildEntityUpdateInput = (entity: Partial<Entity>) => {
  const fields: (keyof Entity)[] = [
    'name',
    'nickname',
    'contactName',
    'email',
    'phone',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'postalCode',
    'country',
    'notes',
  ]
  return fields.reduce((acc, field) => {
    if (entity[field] !== undefined) {
      acc[field] = entity[field]
    }
    return acc
  }, {} as any)
}
