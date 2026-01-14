import { useEffect, useState, useCallback } from 'react'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
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

const TheCutList = ({ measurementsJson, onTotalChange }) => {
  const [measurements, setMeasurements] = useState(defaultMeasurement)
  const [totalInches, setTotalInches] = useState(0)
  const [totalYards, setTotalYards] = useState(0)

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
      prev.map((m, idx) =>
        idx === i ? { ...m, [key]: Number(value) || 0 } : m
      )
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
    setMeasurements(defaultMeasurement)
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    const data = []

    // Skip header row if present
    const startIdx = lines[0].toLowerCase().includes('feet') ? 1 : 0

    for (let i = startIdx; i < lines.length; i++) {
      const [feetStr, inchesStr] = lines[i].split(',').map((s) => s.trim())
      const feet = Number(feetStr)
      const inches = Number(inchesStr)

      if (!isNaN(feet) && !isNaN(inches)) {
        data.push({ feet, inches })
      }
    }

    return data.length > 0 ? data : null
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

  /* ---------------- ui ---------------- */

  return (
    <TooltipProvider>
      <div className="space-y-3 text-center">
        <MeasurementsDisplay
          totalInches={totalInches}
          totalYards={totalYards}
        />

        <CutActions onAdd={addMeasurement} onClear={clearAll} />

        <div className="space-y-2">
          {measurements.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="h-9"
                    placeholder="0"
                    value={m.feet}
                    onChange={(e) =>
                      updateMeasurement(i, 'feet', e.target.value)
                    }
                    onFocus={(e) => {
                      requestAnimationFrame(() => {
                        e.target.select()
                      })
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>Enter feet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={String(m.inches)}
                    onValueChange={(v) => updateMeasurement(i, 'inches', v)}
                  >
                    <SelectTrigger className="h-9 w-[80px]">
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
                <ExportButton
                  data={measurements}
                  variant="default"
                  filename={`${todayAsYYYYMMDD()}-cut-list.csv`}
                  label="Export Cuts"
                />
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
