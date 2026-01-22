export interface UnitLabel {
  id: number
  fullName?: string | null
  pluralName?: string | null
}

export function formatRatePerHour(opts: {
  estimatedMinutesPerUnit?: number | null
  subAmount?: number | null
  retailAmount?: number | null
  unit?: UnitLabel | null
  unitFallback?: UnitLabel | null
}): string {
  const {
    estimatedMinutesPerUnit,
    subAmount,
    retailAmount,
    unit,
    unitFallback,
  } = opts
  const minutes = Number(estimatedMinutesPerUnit ?? 0)
  if (!minutes || minutes <= 0) return '—'

  const perHr = 60 / minutes

  const unitObj = unit ?? unitFallback
  const unitLabel = unitObj
    ? unitObj.id === 1
      ? unitObj.fullName || 'unit'
      : unitObj.pluralName || 'units'
    : 'units'

  // `perHr` is a multiplier: how many units are completed per hour.
  // To get dollar-per-hour, multiply the per-unit amount by the multiplier.
  const subStr =
    subAmount !== undefined && subAmount !== null && !isNaN(Number(subAmount))
      ? `$${(Number(subAmount) * perHr).toFixed(2)}`
      : null

  const retailStr =
    retailAmount !== undefined &&
    retailAmount !== null &&
    !isNaN(Number(retailAmount))
      ? `$${(Number(retailAmount) * perHr).toFixed(2)}`
      : null

  // If we have dollar amounts, show them as "$x.xx per hr" and include
  // the units-per-hour in parentheses. Otherwise show the units-per-hour.
  if (subStr || retailStr) {
    const amounts = [subStr, retailStr].filter(Boolean).join(' ~ ')
    return `${amounts} per hr (${perHr.toFixed(1)} ${unitLabel} / hr)`
  }

  return `${perHr.toFixed(1)} ${unitLabel} / hr`
}

export default formatRatePerHour
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const todayAsYYYYMMDD = (date: Date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

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

// Create estimate reference number in format: [weekNo - Retailer - Client]
export const createEstimateRefNo = (
  retailerName: string | null | undefined,
  clientName: string | null | undefined
): string => {
  const weekNo = getWeekNumber(new Date())
  const retailer = retailerName?.split(' ')[0] || 'Unknown'
  const client = clientName?.split(' ')[0] || 'Unknown'
  return `${weekNo}-${retailer}-${client}`
}

// Build estimate title in format: [weekNumber - RetailerName - ClientName]
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
