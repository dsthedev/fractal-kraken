function formatCurrency(amount: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `$${Math.round(amount)}`
  }
}

export function buildRateSentence(
  actionName?: string,
  materialName?: string,
  context?: string,
  subAmount?: number,
  retailAmount?: number,
  unitName?: string,
  currency: string = 'USD'
): string {
  const parts: string[] = ['The cost']

  if (actionName) parts.push(`to ${actionName}`)
  if (materialName) {
    const target = context ? `${materialName} (${context})` : materialName
    parts.push(target)
  }

  if (subAmount != null || retailAmount != null) {
    const sub = subAmount != null ? formatCurrency(subAmount, currency) : null
    const retail =
      retailAmount != null ? formatCurrency(retailAmount, currency) : null
    const price = sub && retail ? `${sub}-${retail}` : retail || sub
    parts.push(`is ${price}`)
  }

  if (unitName) parts.push(`per ${unitName}`)

  return parts.join(' ')
}
