import { useEffect, useState, useCallback } from 'react'

import { RectangleEllipsis, Eye, Pencil } from 'lucide-react'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const STORAGE_KEY = 'cut-list'
const LABELS_STORAGE_KEY = 'cut-labels'

const defaultMeasurement = [{ feet: 0, inches: 0 }]

const CutActions = ({ onAdd, onClear }) => (
  <div className="flex gap-6">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex-1" onClick={onAdd} variant="lime">
          Add Cut
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add a new measurement to the list</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="flex-1"
          variant="secondary"
          size="sm"
          onClick={onClear}
        >
          Clear All
        </Button>
      </TooltipTrigger>
      <TooltipContent>Remove all measurements and reset</TooltipContent>
    </Tooltip>
  </div>
)

const MeasurementsDisplay = ({ totalInches, totalYards }) => (
  <TooltipProvider>
    <div className="space-y-3 text-center my-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-3xl font-semibold cursor-help">
            {Math.floor(totalInches / 12)}′{totalInches % 12}″
          </div>
        </TooltipTrigger>
        <TooltipContent>Total length in feet and inches</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sm text-muted-foreground cursor-help">
            ~{totalYards.toFixed(2)} yards
          </div>
        </TooltipTrigger>
        <TooltipContent>Approximate total in yards</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
)

interface CutRowLabelProps {
  cutIndex: number
  onLabelChange: (index: number, label: string) => void
}

const CutRowLabel = ({ cutIndex, onLabelChange }: CutRowLabelProps) => {
  const [label, setLabel] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const labels = JSON.parse(localStorage.getItem(LABELS_STORAGE_KEY) || '{}')
    setLabel(labels[cutIndex] || '')
  }, [cutIndex])

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleSave = () => {
    const titleCasedLabel = toTitleCase(label)
    const labels = JSON.parse(localStorage.getItem(LABELS_STORAGE_KEY) || '{}')
    labels[cutIndex] = titleCasedLabel
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels))
    setLabel(titleCasedLabel)
    onLabelChange(cutIndex, titleCasedLabel)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9">
          <RectangleEllipsis className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <p className="text-sm font-medium">Label this cut</p>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Master Bedroom"
            autoFocus
          />
          <Button size="sm" onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const TheCutList = ({ measurementsJson, onTotalChange }) => {
  const [measurements, setMeasurements] = useState(defaultMeasurement)
  const [totalInches, setTotalInches] = useState(0)
  const [totalYards, setTotalYards] = useState(0)
  const [isEditMode, setIsEditMode] = useState(true)
  const [labels, setLabels] = useState<Record<string, string>>({})

  /* ---------------- persistence ---------------- */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setMeasurements(JSON.parse(stored))
    } else if (measurementsJson) {
      setMeasurements(JSON.parse(measurementsJson))
    }
  }, [measurementsJson])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements))
  }, [measurements])

  useEffect(() => {
    const stored = localStorage.getItem(LABELS_STORAGE_KEY)
    if (stored) {
      setLabels(JSON.parse(stored))
    }
  }, [])

  /* ---------------- math ---------------- */

  const toInches = ({ feet, inches }) => feet * 12 + inches
  const inchesToYards = (i) => ((i / 12) * 4) / 3

  useEffect(() => {
    const sum = measurements.reduce((a, m) => a + toInches(m), 0)
    setTotalInches(sum)
    setTotalYards(inchesToYards(sum))
    onTotalChange?.(sum)
  }, [measurements, onTotalChange])

  /* ---------------- handlers ---------------- */

  const updateMeasurement = useCallback((i, key, value) => {
    setMeasurements((prev) =>
      prev.map((m, idx) => {
        if (idx === i) {
          const numValue = Number(value) || 0
          // Prevent negative feet values
          if (key === 'feet' && numValue < 0) {
            return m
          }
          return { ...m, [key]: numValue }
        }
        return m
      })
    )
  }, [])

  const addMeasurement = () =>
    setMeasurements((m) => [...m, { feet: 0, inches: 0 }])

  const removeMeasurement = (i) =>
    setMeasurements((m) =>
      m.length === 1 ? defaultMeasurement : m.filter((_, idx) => idx !== i)
    )

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LABELS_STORAGE_KEY)
    setMeasurements(defaultMeasurement)
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    const data = []

    // Skip header row if present
    const startIdx = lines[0].toLowerCase().includes('feet') ? 1 : 0
    const headers = lines[0]
      .toLowerCase()
      .split(',')
      .map((h) => h.trim())
    const hasLabel = headers.includes('label')

    const labels: Record<string, string> = {}

    for (let i = startIdx; i < lines.length; i++) {
      const columns = lines[i].split(',').map((s) => s.trim())
      const feet = Number(columns[0])
      const inches = Number(columns[1])
      const label = hasLabel ? columns[2] : ''

      if (!isNaN(feet) && !isNaN(inches) && feet >= 0) {
        data.push({ feet, inches })
        if (label && hasLabel) {
          labels[data.length - 1] = label
        }
      }
    }

    if (data.length > 0) {
      // Store labels if any were found
      if (Object.keys(labels).length > 0) {
        localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels))
      }
      return data
    }
    return null
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsed = parseCSV(csvText)

        if (parsed && parsed.length > 0) {
          setMeasurements(parsed)
          // Labels are already stored in localStorage by parseCSV
          const stored = localStorage.getItem(LABELS_STORAGE_KEY)
          if (stored) {
            setLabels(JSON.parse(stored))
          }
          // Reset file input
          event.target.value = ''
        } else {
          alert('Invalid CSV format. Expected columns: feet, inches')
          event.target.value = ''
        }
      } catch (err) {
        alert('Error parsing CSV file')
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    const csvData = measurements
      .map((m, i) => {
        const label = labels[i] || ''
        return `${m.feet},${m.inches},${label}`
      })
      .join('\n')

    const headerRow = 'Feet,Inches,Label\n'
    const fullCSV = headerRow + csvData

    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${todayAsYYYYMMDD()}-cut-list.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /* ---------------- ui ---------------- */

  if (!isEditMode) {
    return (
      <TooltipProvider>
        <div className="space-y-3">
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditMode(true)}
              className="text-xs"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          <div className="space-y-3">
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground font-medium">
                Total Length
              </div>
              <div className="text-2xl font-semibold">
                {Math.floor(totalInches / 12)}′{totalInches % 12}″
              </div>
              <div className="text-xs text-muted-foreground">
                ~{totalYards.toFixed(2)} yards
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium">
                      Area
                    </th>
                    <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2 px-2 text-left">
                        {labels[i] || '—'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {m.feet}′{m.inches}″
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  const feetInchesLabel = () => (
    <>
      <div className="text-xs text-muted-foreground font-medium">Feet</div>
      <div>|</div>
      <div className="text-xs text-muted-foreground font-medium">Inches</div>
    </>
  )

  return (
    <TooltipProvider>
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditMode(false)}
            className="text-xs"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>

        <MeasurementsDisplay
          totalInches={totalInches}
          totalYards={totalYards}
        />

        <CutActions onAdd={addMeasurement} onClear={clearAll} />

        <div className="space-y-2">
          <div className="flex text-xs text-gray-500 items-center justify-center gap-2 px-1">
            {feetInchesLabel()}
          </div>

          {measurements.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <CutRowLabel
                cutIndex={i}
                onLabelChange={() => {
                  const stored = localStorage.getItem(LABELS_STORAGE_KEY)
                  if (stored) {
                    setLabels(JSON.parse(stored))
                  }
                }}
              />

              <Input
                type="number"
                inputMode="numeric"
                className="h-9"
                placeholder="0"
                value={m.feet}
                onChange={(e) => updateMeasurement(i, 'feet', e.target.value)}
                onFocus={(e) => {
                  requestAnimationFrame(() => {
                    e.target.select()
                  })
                }}
                min="0"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={String(m.inches)}
                    onValueChange={(v) => updateMeasurement(i, 'inches', v)}
                  >
                    <SelectTrigger className="h-9 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }).map((_, n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>Select inches (0-11)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeMeasurement(i)}
                  >
                    ×
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove this measurement</TooltipContent>
              </Tooltip>
            </div>
          ))}

          <div className="flex text-xs text-gray-500 items-center justify-center gap-2 px-1">
            {feetInchesLabel()}
          </div>
        </div>

        <CutActions onAdd={addMeasurement} onClear={clearAll} />

        <MeasurementsDisplay
          totalInches={totalInches}
          totalYards={totalYards}
        />

        <hr className="my-4" />

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <span>Import Cuts</span>
                </Button>
              </label>
            </TooltipTrigger>
            <TooltipContent>
              Upload a CSV file to replace measurements
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={handleExport}
                >
                  Export Cuts
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Download measurements as CSV file</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default TheCutList
