import { useState } from 'react'

import { useMutation } from '@cedarjs/web'

type ConvertedRow = {
  description?: string
  value?: number
  mValue?: number
  unit?: string
  task?: string
  material?: string
}

interface ParsedRatesData {
  unitsPath: string
  servicesPath: string
  ratesPath: string
  unitsCount: number
  servicesCount: number
  ratesCount: number
}

const PARSE_RATES_DATA_MUTATION = gql`
  mutation ParseRatesData {
    parseRatesData {
      unitsPath
      servicesPath
      ratesPath
      unitsCount
      servicesCount
      ratesCount
    }
  }
`

const parseCsv = (text: string) => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines[0].replace(/"/g, '').split(',')
  const rows = lines.slice(1).map((l) => {
    const cols = l.match(/("[^"]*"|[^,]+)/g) || []
    return cols.map((c) => c.replace(/^"|"$/g, '').trim())
  })
  return { headers, rows }
}

const convertRow = (headers: string[], cols: string[]) => {
  const obj: Record<string, string> = {}
  headers.forEach((h, i) => (obj[h] = cols[i] || ''))

  return {
    description: (obj.description || obj.note || obj.task) as
      | string
      | undefined,
    value: obj.value ? parseInt(obj.value, 10) : undefined,
    mValue: obj.mValue ? parseInt(obj.mValue, 10) : undefined,
    unit: obj.unit || undefined,
    task: obj.task || undefined,
    material: obj.material || undefined,
  } as ConvertedRow
}

const guessAction = (text: string) => {
  const t = (text || '').toLowerCase()
  if (/install|lay|set|installing|installing|install\b/.test(t))
    return 'INSTALL'
  if (/remove|take-?up|tear|tearup|rip|ripup|scrape/.test(t)) return 'REMOVE'
  if (/replace|replace\b/.test(t)) return 'REPLACE'
  if (/repair|restretch|restretch\b/.test(t)) return 'REPAIR'
  if (/finish|feather|grind|sand|polish/.test(t)) return 'FINISH'
  if (/prepare|subfloor|prep|feather finish|ardex/.test(t)) return 'PREPARE'
  if (/clean|scrub|wash/.test(t)) return 'CLEAN'
  if (/move|reset|furniture|appliance|trip charge|drive/.test(t)) return 'MOVE'
  if (/inspect|survey|measure/.test(t)) return 'INSPECT'
  return 'CUSTOM'
}

const guessContext = (text: string) => {
  const t = (text || '').toLowerCase()
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
    if (t.includes(k)) return k
  }
  return ''
}

const inferServices = (rows: ConvertedRow[]) => {
  const out: Record<string, string>[] = []
  for (const r of rows) {
    const combined = [r.task, r.material, r.description, r.unit]
      .filter(Boolean)
      .join(' ')
    const action = guessAction(combined)
    const context = guessContext(combined)
    const material =
      r.material || extractMaterialFromText(r.description || r.task || '')
    const description = (
      r.description || `${r.task || ''} ${r.material || ''}`
    ).trim()

    out.push({
      action,
      material: material || '',
      context: context || '',
      description,
    })
  }

  // Deduplicate rows by key
  const seen = new Set<string>()
  const dedup: Record<string, string>[] = []
  for (const o of out) {
    const key = `${o.action}||${o.material}||${o.context}||${o.description}`
    if (!seen.has(key)) {
      seen.add(key)
      dedup.push(o)
    }
  }
  return dedup
}

const extractMaterialFromText = (text: string) => {
  const t = (text || '').toLowerCase()
  const mats = [
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
  ]
  for (const m of mats) {
    if (t.includes(m)) return m
  }
  // fallback: first word
  const first = (text || '').split(/\s+/)[0] || ''
  return first
}

const convertToCsv = (rows: Record<string, string>[]) => {
  const headers = ['action', 'material', 'context', 'description']
  const esc = (s: string) => '"' + String(s || '').replace(/"/g, '""') + '"'
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      [r.action || '', r.material || '', r.context || '', r.description || '']
        .map(esc)
        .join(',')
    )
  }
  return lines.join('\n')
}

const OldDataConverter = () => {
  const [preview, setPreview] = useState<ConvertedRow[] | null>(null)
  const [fullConverted, setFullConverted] = useState<ConvertedRow[] | null>(
    null
  )
  const [count, setCount] = useState<number | null>(null)
  const [inferredCsv, setInferredCsv] = useState<string | null>(null)
  const [inferredRows, setInferredRows] = useState<
    Record<string, string>[] | null
  >(null)
  const [parsedRates, setParsedRates] = useState<ParsedRatesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [parseRatesData] = useMutation(PARSE_RATES_DATA_MUTATION)

  const handleFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = String(e.target?.result || '')
      const { headers, rows } = parseCsv(text)
      const converted = rows.map((r) => convertRow(headers, r))
      setFullConverted(converted)
      setPreview(converted.slice(0, 50))
      setCount(converted.length)
      setInferredCsv(null)
      setInferredRows(null)
    }
    reader.readAsText(file)
  }

  const handleParseRatesData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await parseRatesData()
      if (result.data?.parseRatesData) {
        setParsedRates(result.data.parseRatesData)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse rates data'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          aria-label="Upload CSV"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="text-sm text-muted-foreground">
          Upload an exported CSV to preview converted rows.
        </div>
      </div>

      {count !== null && <div>Rows parsed: {count}</div>}

      {preview && (
        <div className="overflow-auto border rounded p-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="pr-4">Task</th>
                <th className="pr-4">Material</th>
                <th className="pr-4">Unit</th>
                <th className="pr-4">Value</th>
                <th className="pr-4">mValue</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="pr-4">{r.task}</td>
                  <td className="pr-4">{r.material}</td>
                  <td className="pr-4">{r.unit}</td>
                  <td className="pr-4">{r.value ?? ''}</td>
                  <td className="pr-4">{r.mValue ?? ''}</td>
                  <td>{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-4">
        <button
          className="px-3 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => {
            if (!fullConverted) return
            const inferred = inferServices(fullConverted)
            setInferredRows(inferred)
            setInferredCsv(convertToCsv(inferred))
          }}
        >
          infer services from old rates
        </button>
      </div>

      {inferredRows && inferredRows.length > 0 && (
        <div className="mt-4 border rounded p-2">
          <h2 className="font-semibold mb-2">Inferred Services (preview)</h2>
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="pr-4">action</th>
                  <th className="pr-4">material</th>
                  <th className="pr-4">context</th>
                  <th className="pr-4">description</th>
                </tr>
              </thead>
              <tbody>
                {inferredRows.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="pr-4">{r.action}</td>
                    <td className="pr-4">{r.material}</td>
                    <td className="pr-4">{r.context}</td>
                    <td>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex gap-2">
            {inferredCsv && (
              <a
                className="px-3 py-2 rounded bg-secondary text-secondary-foreground"
                href={URL.createObjectURL(
                  new Blob([inferredCsv], { type: 'text/csv' })
                )}
                download="inferred_services.csv"
              >
                Download CSV
              </a>
            )}
            <button
              className="px-3 py-2 rounded border"
              onClick={() => {
                setInferredCsv(null)
                setInferredRows(null)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-4">
          Parse Existing Rates Data
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Parse the old rates CSV file from the database and extract into
          separate units, services, and rates with matching IDs.
        </p>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={handleParseRatesData}
          disabled={isLoading}
        >
          {isLoading ? 'Parsing...' : 'Parse Rates Data'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded bg-red-100 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {parsedRates && (
        <div className="mt-4 border rounded p-4 bg-green-50">
          <h3 className="font-semibold mb-3">Parse Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white rounded border">
              <p className="text-sm font-medium">Units Created</p>
              <p className="text-2xl font-bold">{parsedRates.unitsCount}</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <p className="text-sm font-medium">Services Created</p>
              <p className="text-2xl font-bold">{parsedRates.servicesCount}</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <p className="text-sm font-medium">Rates Created</p>
              <p className="text-2xl font-bold">{parsedRates.ratesCount}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Units file:</span>
              <br />
              <code className="bg-white px-2 py-1 rounded border text-xs">
                {parsedRates.unitsPath}
              </code>
            </p>
            <p>
              <span className="font-medium">Services file:</span>
              <br />
              <code className="bg-white px-2 py-1 rounded border text-xs">
                {parsedRates.servicesPath}
              </code>
            </p>
            <p>
              <span className="font-medium">Rates file:</span>
              <br />
              <code className="bg-white px-2 py-1 rounded border text-xs">
                {parsedRates.ratesPath}
              </code>
            </p>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            Files have been created in the scripts/data directory. The IDs are
            synchronized between units, services, and rates.
          </p>

          <button
            className="mt-4 px-3 py-1 rounded border text-sm"
            onClick={() => setParsedRates(null)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export default OldDataConverter
