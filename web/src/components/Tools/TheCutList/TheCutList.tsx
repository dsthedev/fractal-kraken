import { useEffect, useState } from 'react'

import { Pencil, PlusCircleIcon } from 'lucide-react'

import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/components/ui/popover'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const STORAGE_KEY = 'cut-list'
const LABELS_STORAGE_KEY = 'cut-labels'
const JOB_NAME_KEY = 'cut-list-jobName'

const defaultMeasurement = [{ feet: 0, inches: 0 }]

const CutActions = ({ onAdd, onClear }) => (
  <div className="flex gap-6">
    <Button className="flex-1" variant="outline" size="sm" onClick={onClear}>
      Clear All
    </Button>
    <Button className="flex-1" onClick={onAdd} variant="lime">
      <PlusCircleIcon />
      Add Cut
    </Button>
  </div>
)

interface EditCutPopoverProps {
  measurement: { feet: number; inches: number }
  label: string
  onSave: (label: string, feet: number, inches: number) => void
  onRemove: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const EditCutPopover = ({
  measurement,
  label,
  onSave,
  onRemove,
  isOpen,
  onOpenChange,
}: EditCutPopoverProps) => {
  const [open, setOpen] = useState(isOpen || false)
  const [editLabel, setEditLabel] = useState(label)
  const [editFeet, setEditFeet] = useState(measurement.feet)
  const [editInches, setEditInches] = useState(measurement.inches)

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen)
    }
  }, [isOpen])

  useEffect(() => {
    setEditLabel(label)
    setEditFeet(measurement.feet)
    setEditInches(measurement.inches)
  }, [label, measurement])

  const handleSave = () => {
    onSave(editLabel, editFeet, editInches)
    setOpen(false)
    onOpenChange?.(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleInchesChange = (value: string) => {
    let inches = Number(value) || 0
    // Clamp to 0-11 range
    inches = Math.max(0, Math.min(11, inches))
    setEditInches(inches)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9">
          <Pencil className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <label htmlFor="label-input" className="text-sm font-medium">
              Label
            </label>
            <Input
              id="label-input"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="e.g., Master Bedroom"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="feet-input" className="text-sm font-medium">
                Feet
              </label>
              <Input
                id="feet-input"
                type="number"
                inputMode="numeric"
                value={editFeet}
                onChange={(e) => setEditFeet(Number(e.target.value) || 0)}
                onFocus={(e) => {
                  requestAnimationFrame(() => {
                    e.target.select()
                  })
                }}
                className="mt-1 text-lg"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="inches-input" className="text-sm font-medium">
                Inches
              </label>
              <Input
                id="inches-input"
                type="number"
                inputMode="numeric"
                value={editInches}
                onChange={(e) => handleInchesChange(e.target.value)}
                onFocus={(e) => {
                  requestAnimationFrame(() => {
                    e.target.select()
                  })
                }}
                className="mt-1 text-lg"
                min="0"
                max="11"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onRemove()
                setOpen(false)
                onOpenChange?.(false)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const TheCutList = ({ measurementsJson, onTotalChange }) => {
  const [measurements, setMeasurements] = useState(defaultMeasurement)
  const [totalInches, setTotalInches] = useState(0)
  const [totalYards, setTotalYards] = useState(0)
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [jobName, setJobName] = useState('')
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null)

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

  useEffect(() => {
    const stored = localStorage.getItem(JOB_NAME_KEY)
    if (stored) {
      setJobName(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(JOB_NAME_KEY, jobName)
  }, [jobName])

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

  const addMeasurement = () => {
    const newIndex = measurements.length
    setMeasurements((m) => [...m, { feet: 0, inches: 0 }])
    // Open the popover for the newly added item
    setOpenPopoverIndex(newIndex)
  }

  const removeMeasurement = (i) =>
    setMeasurements((m) =>
      m.length === 1 ? defaultMeasurement : m.filter((_, idx) => idx !== i)
    )

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LABELS_STORAGE_KEY)
    localStorage.removeItem(JOB_NAME_KEY)
    setMeasurements(defaultMeasurement)
    setLabels({})
    setJobName('')
    setOpenPopoverIndex(null)
  }

  const handleEditSave = (
    cutIndex: number,
    newLabel: string,
    newFeet: number,
    newInches: number
  ) => {
    // Update measurement
    setMeasurements((prev) =>
      prev.map((m, idx) => {
        if (idx === cutIndex) {
          return { feet: newFeet, inches: newInches }
        }
        return m
      })
    )

    // Update label
    const updatedLabels = { ...labels }
    if (newLabel) {
      const titleCasedLabel = newLabel
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      updatedLabels[cutIndex] = titleCasedLabel
    } else {
      delete updatedLabels[cutIndex]
    }
    setLabels(updatedLabels)
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(updatedLabels))
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return null

    const data = []
    const labels: Record<string, string> = {}

    // Detect header row
    const firstLine = lines[0].toLowerCase()
    const isHeader =
      firstLine.includes('feet') ||
      firstLine.includes('inch') ||
      firstLine.includes('label')
    const startIdx = isHeader ? 1 : 0

    // Parse each line
    for (let i = startIdx; i < lines.length; i++) {
      if (!lines[i].trim()) continue // Skip empty lines

      const columns = lines[i].split(',').map((s) => s.trim())
      const feet = Number(columns[0])
      const inches = Number(columns[1])
      const label = columns[2] || ''

      // Accept if we have valid feet and inches
      if (!isNaN(feet) && !isNaN(inches) && feet >= 0 && inches >= 0) {
        data.push({ feet, inches })
        if (label) {
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
          setOpenPopoverIndex(null)
        } else {
          alert('Invalid CSV format. Expected columns: feet, inches')
          event.target.value = ''
        }
      } catch {
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
    const filename = jobName
      ? `${todayAsYYYYMMDD()}-${jobName}-cut-list.csv`
      : `${todayAsYYYYMMDD()}-cut-list.csv`
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /* ---------------- ui ---------------- */

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-sm text-muted-foreground font-medium">
          Total Length
        </div>
        <div className="text-3xl font-semibold">
          {Math.floor(totalInches / 12)}′{totalInches % 12}″
        </div>
        <div className="text-sm text-muted-foreground">
          ~{totalYards.toFixed(2)} yards
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-lg">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-3 text-sm text-muted-foreground font-medium">
                Cut
              </th>
              <th className="text-right py-3 px-3 text-sm text-muted-foreground font-medium">
                Length
              </th>
              <th className="text-center py-3 px-3 text-sm text-muted-foreground font-medium">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-3 px-3 text-left">{labels[i] || '—'}</td>
                <td className="py-3 px-3 text-right font-mono text-2xl">
                  {m.feet}′{m.inches}″
                </td>
                <td className="py-3 px-3 text-center">
                  <EditCutPopover
                    measurement={m}
                    label={labels[i] || ''}
                    onSave={(label, feet, inches) =>
                      handleEditSave(i, label, feet, inches)
                    }
                    onRemove={() => removeMeasurement(i)}
                    isOpen={openPopoverIndex === i}
                    onOpenChange={(open) =>
                      setOpenPopoverIndex(open ? i : null)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CutActions onAdd={addMeasurement} onClear={clearAll} />

      <hr className="my-4" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobName">Job Name (optional)</Label>
          <Input
            id="jobName"
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="e.g., Smith Residence"
            className="text-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <input
            id="csv-import"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => document.getElementById('csv-import')?.click()}
          >
            Import Cuts
          </Button>

          <Button variant="default" size="sm" onClick={handleExport}>
            Export Cuts
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TheCutList
