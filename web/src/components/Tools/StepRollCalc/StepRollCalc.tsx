import { useState, useEffect } from 'react'

import { Download, Upload, RotateCcw } from 'lucide-react'

import StepRollCalcVisualizer from 'src/components/Tools/StepRollCalcVisualizer/StepRollCalcVisualizer'
import { Button } from 'src/components/ui/button'
import { Checkbox } from 'src/components/ui/checkbox'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import { todayAsYYYYMMDD } from 'src/lib/utils'

// Constants
const STORAGE_KEY = 'stepRollCalc'
const JOB_NAME_KEY = 'stepRollCalc_jobName'
const DEFAULT_VALUES = {
  profile: 20,
  stepWidth: 42,
  steps: 13,
  rollWidth: 12,
  showFtIn: false,
}

const ROLL_WIDTH_OPTIONS = [
  { value: 12, label: "12'" },
  { value: 15, label: "15'" },
]

// Types
interface StoredValues {
  profile: number
  stepWidth: number
  steps: number
  rollWidth: number
  showFtIn: boolean
}

interface CalculationResult {
  totalCarpetLength: number
  possibleColumns: number
  stepsPerColumn: number
}

// Storage utilities
const loadFromStorage = (): StoredValues => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : DEFAULT_VALUES
}

const saveToStorage = (values: StoredValues): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
}

const loadJobName = (): string => {
  return localStorage.getItem(JOB_NAME_KEY) || ''
}

const saveJobName = (name: string): void => {
  localStorage.setItem(JOB_NAME_KEY, name)
}

const exportToCSV = (
  values: StoredValues,
  result: CalculationResult,
  jobName: string
): void => {
  const csv = [
    ['Parameter', 'Value', 'Unit'],
    ['Steps', values.steps, 'count'],
    ['Step Width', values.stepWidth, 'inches'],
    ['Profile', values.profile, 'inches'],
    ['Roll Width', values.rollWidth, 'feet'],
    ['', '', ''],
    ['Result', 'Value', 'Unit'],
    ['Total Carpet Length', result.totalCarpetLength.toFixed(2), 'feet'],
    ['Possible Columns', result.possibleColumns, 'count'],
    ['Steps Per Column', result.stepsPerColumn, 'count'],
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = jobName
    ? `${todayAsYYYYMMDD()}-${jobName}-step-calc.csv`
    : `${todayAsYYYYMMDD()}-step-calc.csv`
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

// Calculation
const calculateCarpetLength = (
  profile: number,
  stepWidth: number,
  steps: number,
  rollWidth: number
): CalculationResult => {
  const rollWidthInches = rollWidth * 12
  const possibleColumns = Math.floor(rollWidthInches / stepWidth)
  const stepsPerColumn = Math.ceil(steps / possibleColumns)
  const totalCarpetLength = (stepsPerColumn * profile) / 12

  return { totalCarpetLength, possibleColumns, stepsPerColumn }
}

// Component
const StepRollCalc: React.FC = () => {
  const [values, setValues] = useState<StoredValues>(DEFAULT_VALUES)
  const [jobName, setJobName] = useState('')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    setValues(loadFromStorage())
    setJobName(loadJobName())
    setMounted(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (mounted) {
      saveToStorage(values)
    }
  }, [values, mounted])

  useEffect(() => {
    saveJobName(jobName)
  }, [jobName])

  const calculation = calculateCarpetLength(
    values.profile,
    values.stepWidth,
    values.steps,
    values.rollWidth
  )

  const displayFeet = Math.floor(calculation.totalCarpetLength)
  const displayInches = Math.ceil(
    (calculation.totalCarpetLength - displayFeet) * 12
  )

  // Handlers
  const handleInputChange = (field: keyof StoredValues, inputValue: string) => {
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 9999) {
      setValues((prev) => ({ ...prev, [field]: numValue }))
    }
  }

  const handleToggleProfile = (amount: number) => {
    setValues((prev) => ({
      ...prev,
      profile: Math.max(0, prev.profile + amount),
    }))
  }

  const handleToggleFtIn = () => {
    setValues((prev) => ({ ...prev, showFtIn: !prev.showFtIn }))
  }

  const handleReset = () => {
    setValues(DEFAULT_VALUES)
  }

  const handleExport = () => {
    exportToCSV(values, calculation, jobName)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const imported: Partial<StoredValues> = {}
      lines.forEach((line) => {
        const [key, value] = line.split(',')
        if (key === 'Steps') imported.steps = parseInt(value, 10)
        if (key === 'Step Width') imported.stepWidth = parseInt(value, 10)
        if (key === 'Profile') imported.profile = parseInt(value, 10)
        if (key === 'Roll Width') imported.rollWidth = parseInt(value, 10)
      })
      if (Object.keys(imported).length > 0) {
        setValues((prev) => ({ ...prev, ...imported }))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 p-4 max-w-2xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Step Roll Calculator</h1>
        <p className="text-sm text-gray-600">
          Calculate carpet needed to cover a set of steps.
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="steps">Steps</Label>
            <Input
              id="steps"
              type="number"
              value={values.steps}
              onChange={(e) => handleInputChange('steps', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="text-right text-2xl font-mono"
            />
            <span className="text-xs text-gray-500">count</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepWidth">Step Width</Label>
            <Input
              id="stepWidth"
              type="number"
              value={values.stepWidth}
              onChange={(e) => handleInputChange('stepWidth', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="text-right text-2xl font-mono"
            />
            <span className="text-xs text-gray-500">inches</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Profile</Label>
            <Input
              id="profile"
              type="number"
              value={values.profile}
              onChange={(e) => handleInputChange('profile', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="text-right text-2xl font-mono"
            />
            <span className="text-xs text-gray-500">inches</span>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleProfile(-2)}
              >
                −2"
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleProfile(2)}
              >
                +2"
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollWidth">Roll Width</Label>
            <Select
              value={String(values.rollWidth)}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, rollWidth: parseInt(v, 10) }))
              }
            >
              <SelectTrigger id="rollWidth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLL_WIDTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="space-y-2 border-l-4 border-blue-500 bg-blue-100 dark:bg-blue-800 p-4">
        <div className="text-4xl font-mono font-bold">
          {displayFeet}
          {values.showFtIn ? ' ft' : "'"}, {displayInches}
          {values.showFtIn ? ' in' : '"'}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="showFtIn"
            checked={values.showFtIn}
            onCheckedChange={handleToggleFtIn}
          />
          <Label htmlFor="showFtIn" className="text-sm cursor-pointer">
            Display as ft / in
          </Label>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm space-y-1 text-gray-700">
        <p>
          To get {values.steps} steps, a{' '}
          <strong>{calculation.totalCarpetLength.toFixed(2)}'</strong> long roll
          of carpet is necessary.
        </p>
        <p>
          This allows {calculation.stepsPerColumn} steps per column with{' '}
          <strong>{calculation.possibleColumns}</strong> possible columns at{' '}
          {values.stepWidth}".
        </p>
      </div>

      {/* Visualizer */}
      <div className="border-y">
        <StepRollCalcVisualizer
          profile={values.profile}
          stepWidth={values.stepWidth}
          steps={values.steps}
          rollWidth={values.rollWidth}
        />
      </div>

      {/* Job Name Input */}
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

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <label>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </span>
          </Button>
        </label>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Warnings */}
      <div className="space-y-2 text-xs text-gray-600">
        <p>
          <strong>Notice:</strong> Typical steps have an ~18" profile. Add 2"
          for installation variance. This is a reference tool only.
        </p>
        <p>
          <strong>Always:</strong> Double-check numbers before using for
          estimates and invoices.
        </p>
      </div>
    </div>
  )
}

export default StepRollCalc
