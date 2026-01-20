import { useMemo, useRef, useState } from 'react'

import { Metadata } from '@cedarjs/web'

import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Input } from 'src/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'
import { cn } from 'src/lib/utils'

type RateRow = {
  task: string
  material: string
  unit: string
  value: number
  mValue: number
  description: string
}

type SortKey = keyof Pick<
  RateRow,
  'task' | 'material' | 'unit' | 'value' | 'mValue' | 'description'
>

const headers: { key: SortKey; label: string }[] = [
  { key: 'task', label: 'Task' },
  { key: 'material', label: 'Material' },
  { key: 'unit', label: 'Unit' },
  { key: 'value', label: 'Value' },
  { key: 'mValue', label: 'MValue' },
  { key: 'description', label: 'Description' },
]

const numberFromString = (raw?: string | null) => {
  if (!raw) return 0
  const cleaned = raw.replace(/[$,]/g, '').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

// CSV stores monetary values in pennies; convert to dollars for display.
const formatCurrency = (valueInPennies: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(valueInPennies / 100)

const parseCsv = (text: string): RateRow[] => {
  const rows: string[][] = []
  let current: string[] = []
  let cell = ''
  let inQuotes = false

  const flushCell = () => {
    current.push(cell)
    cell = ''
  }

  const flushRow = () => {
    if (current.length) {
      rows.push(current)
      current = []
    }
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      flushCell()
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      flushCell()
      flushRow()
      if (char === '\r' && next === '\n') i++
      continue
    }

    cell += char
  }

  flushCell()
  flushRow()

  if (!rows.length) return []

  const header = rows[0].map((h) => h.trim())
  const dataRows = rows.slice(1)

  const keyIndex = (key: string) => {
    const lower = key.toLowerCase()
    const idx = header.findIndex((h) => h.toLowerCase() === lower)
    return idx >= 0 ? idx : -1
  }

  const idxTask = keyIndex('task')
  const idxMaterial = keyIndex('material')
  const idxUnit = keyIndex('unit')
  const idxValue = keyIndex('value')
  const idxMValue = keyIndex('mValue')
  const idxDescription =
    keyIndex('description') !== -1 ? keyIndex('description') : keyIndex('note')

  return dataRows
    .filter((row) => row.some((cellValue) => cellValue.trim() !== ''))
    .map((row) => ({
      task: idxTask >= 0 ? (row[idxTask] ?? '') : '',
      material: idxMaterial >= 0 ? (row[idxMaterial] ?? '') : '',
      unit: idxUnit >= 0 ? (row[idxUnit] ?? '') : '',
      value: numberFromString(idxValue >= 0 ? (row[idxValue] ?? '') : ''),
      mValue: numberFromString(idxMValue >= 0 ? (row[idxMValue] ?? '') : ''),
      description: idxDescription >= 0 ? (row[idxDescription] ?? '') : '',
    }))
}

const ViewOldRatesPage = () => {
  const [rows, setRows] = useState<RateRow[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('task')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const sortedRows = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return copy
  }, [rows, sortKey, direction])

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const parsed = parseCsv(text)
    setRows(parsed)
  }

  const reset = () => {
    setRows([])
    setSortKey('task')
    setDirection('asc')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection(direction === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setDirection('asc')
    }
  }

  return (
    <>
      <Metadata
        title="View Old Rates"
        description="Import a CSV export of legacy rates for quick review"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Legacy Rates CSV Viewer</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Upload a CSV export to see task, material, units, and values.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(({ key, label }) => {
                      const isActive = sortKey === key
                      const isAsc = isActive && direction === 'asc'
                      const isDesc = isActive && direction === 'desc'

                      return (
                        <TableHead key={key}>
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className={cn(
                              'text-left w-full px-1 py-1 rounded hover:bg-muted transition-colors',
                              isActive ? 'font-semibold' : 'font-normal'
                            )}
                          >
                            <span className="inline-flex items-center gap-1">
                              {label}
                              {isAsc && '(asc)'}
                              {isDesc && '(desc)'}
                            </span>
                          </button>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row, idx) => (
                    <TableRow key={`${row.task}-${row.material}-${idx}`}>
                      <TableCell>{row.task}</TableCell>
                      <TableCell>{row.material}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>{formatCurrency(row.value)}</TableCell>
                      <TableCell>{formatCurrency(row.mValue)}</TableCell>
                      <TableCell className="whitespace-normal">
                        {row.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  Showing {sortedRows.length} rate
                  {sortedRows.length === 1 ? '' : 's'}
                </TableCaption>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ViewOldRatesPage
