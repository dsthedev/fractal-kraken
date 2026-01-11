import * as fs from 'fs'
import * as path from 'path'

interface RawRateRow {
  id: string
  value: string
  mValue: string
  unit: string
  task: string
  material: string
  note: string
  description: string
}

interface ParsedUnit {
  id: number
  fullName: string
  shortName: string
}

interface ParsedService {
  id: number
  action: string
  material: string
  context: string
  description: string
}

interface ParsedRate {
  id: number
  serviceId: number
  unitId: number
  subAmount: number
  retailAmount: number
  description: string
}

/**
 * Parse the old rates CSV file and extract units, services, and rates
 * Creates 3 new CSV files with the inferred data
 */
export const parseRatesData = async () => {
  const rateCsvPath = path.join(
    process.cwd(),
    'scripts/data/20260109-export-rates.csv'
  )

  if (!fs.existsSync(rateCsvPath)) {
    throw new Error(`Rates CSV file not found at ${rateCsvPath}`)
  }

  const csvContent = fs.readFileSync(rateCsvPath, 'utf-8')
  const rows = parseRatesCsv(csvContent)

  // Extract unique units, services, and create rates with matching IDs
  const units = new Map<string, ParsedUnit>()
  const services = new Map<string, ParsedService>()
  const rates: ParsedRate[] = []

  let unitId = 1
  let serviceId = 1
  let rateId = 1

  for (const row of rows) {
    // Process unit
    const unitKey = row.unit.toLowerCase().trim()
    if (unitKey && !units.has(unitKey)) {
      units.set(unitKey, {
        id: unitId,
        fullName: formatUnitName(row.unit),
        shortName: row.unit,
      })
      unitId++
    }
    const currentUnitId = units.get(unitKey)?.id || 1

    // Process service
    const action = guessAction(row.task)
    const material = row.material || extractMaterial(row.description)
    const context = guessContext([row.task, row.material, row.description])
    const serviceKey = `${action}||${material}||${context}`

    if (!services.has(serviceKey)) {
      services.set(serviceKey, {
        id: serviceId,
        action,
        material,
        context,
        description:
          row.description || `${row.task || ''} ${row.material || ''}`.trim(),
      })
      serviceId++
    }
    const currentServiceId = services.get(serviceKey)?.id || 1

    // Create rate with current IDs
    rates.push({
      id: rateId,
      serviceId: currentServiceId,
      unitId: currentUnitId,
      subAmount: parseInt(row.value, 10) || 0,
      retailAmount: parseInt(row.mValue, 10) || 0,
      description: row.description,
    })
    rateId++
  }

  // Write CSV files
  const outputDir = path.join(process.cwd(), 'scripts/data')
  const timestamp = new Date().toISOString().split('T')[0]

  const unitsPath = path.join(
    outputDir,
    `${timestamp}-inferred-measurement-units.csv`
  )
  const servicesPath = path.join(
    outputDir,
    `${timestamp}-inferred-services.csv`
  )
  const ratesPath = path.join(outputDir, `${timestamp}-inferred-rates.csv`)

  fs.writeFileSync(unitsPath, writeUnitsCSV(Array.from(units.values())))
  fs.writeFileSync(
    servicesPath,
    writeServicesCSV(Array.from(services.values()))
  )
  fs.writeFileSync(ratesPath, writeRatesCSV(rates))

  return {
    unitsPath,
    servicesPath,
    ratesPath,
    unitsCount: units.size,
    servicesCount: services.size,
    ratesCount: rates.length,
  }
}

/**
 * Parse rates CSV file
 */
function parseRatesCsv(content: string): RawRateRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  const headers = lines[0]
    .replace(/"/g, '')
    .split(',')
    .map((h) => h.trim())

  const rows: RawRateRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/("[^"]*"|[^,]+)/g) || []
    const values = cols.map((c) => c.replace(/^"|"$/g, '').trim())

    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })

    rows.push({
      id: row.id || '',
      value: row.value || '0',
      mValue: row.mValue || '0',
      unit: row.unit || '',
      task: row.task || '',
      material: row.material || '',
      note: row.note || '',
      description: row.description || '',
    })
  }

  return rows
}

/**
 * Guess the action based on task/description
 */
function guessAction(text: string): string {
  const t = (text || '').toLowerCase()
  if (/install|lay|set|installing/.test(t)) return 'INSTALL'
  if (/remove|take-?up|tear|tearup|rip|ripup|scrape/.test(t)) return 'REMOVE'
  if (/replace/.test(t)) return 'REPLACE'
  if (/repair|restretch/.test(t)) return 'REPAIR'
  if (/finish|feather|grind|sand|polish/.test(t)) return 'FINISH'
  if (/prepare|subfloor|prep|feather finish|ardex/.test(t)) return 'PREPARE'
  if (/clean|scrub|wash/.test(t)) return 'CLEAN'
  if (/move|reset|furniture|appliance|trip charge|drive|drive/.test(t))
    return 'MOVE'
  if (/inspect|survey|measure/.test(t)) return 'INSPECT'
  if (/perform/.test(t)) return 'PERFORM'
  return 'CUSTOM'
}

/**
 * Guess the context from text
 */
function guessContext(texts: (string | undefined)[]): string {
  const combined = texts.filter(Boolean).join(' ').toLowerCase()
  const keywords = [
    'pattern',
    'flight',
    'backsplash',
    'sheet',
    'tile',
    'base',
    'shoe',
    'inlay',
    'vinyl',
    'lvt',
    'ceramic',
    'carpet',
    'underlayment',
    'trim',
  ]

  for (const k of keywords) {
    if (combined.includes(k)) return k
  }

  return ''
}

/**
 * Extract material from description
 */
function extractMaterial(text: string): string {
  const t = (text || '').toLowerCase()
  const materials = [
    'carpet',
    'vinyl',
    'tile',
    'plywood',
    'underlayment',
    'trim',
    'base',
    'shoe',
    'lvt',
    'ceramic',
    'sheet',
    'flight',
    'appliance',
    'furniture',
    'time',
    'transition',
  ]

  for (const m of materials) {
    if (t.includes(m)) return m
  }

  const first = text.split(/\s+/)[0] || ''
  return first
}

/**
 * Format unit name for CSV
 */
function formatUnitName(unit: string): string {
  const mapping: Record<string, string> = {
    sqft: 'square foot',
    sqyd: 'square yard',
    lnft: 'linear foot',
    item: 'item',
    day: 'day',
    flight: 'flight (steps)',
    sheet: 'sheet',
    area: 'area',
  }

  return mapping[unit.toLowerCase().trim()] || unit
}

/**
 * Write units CSV
 */
function writeUnitsCSV(units: ParsedUnit[]): string {
  const headers = ['id', 'fullName', 'shortName']
  const lines = [headers.join(',')]

  for (const u of units) {
    const row = [u.id, escapeCSV(u.fullName), escapeCSV(u.shortName)]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

/**
 * Write services CSV
 */
function writeServicesCSV(services: ParsedService[]): string {
  const headers = ['id', 'action', 'material', 'context', 'description']
  const lines = [headers.join(',')]

  for (const s of services) {
    const row = [
      s.id,
      escapeCSV(s.action),
      escapeCSV(s.material),
      escapeCSV(s.context),
      escapeCSV(s.description),
    ]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

/**
 * Write rates CSV
 */
function writeRatesCSV(rates: ParsedRate[]): string {
  const headers = [
    'id',
    'serviceId',
    'unitId',
    'subAmount',
    'retailAmount',
    'description',
  ]
  const lines = [headers.join(',')]

  for (const r of rates) {
    const row = [
      r.id,
      r.serviceId,
      r.unitId,
      r.subAmount,
      r.retailAmount,
      escapeCSV(r.description),
    ]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string | number): string {
  if (typeof field === 'number') return String(field)
  const str = String(field || '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}
