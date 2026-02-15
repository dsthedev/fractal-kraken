import { useState, useEffect } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/components/ui/accordion'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/components/ui/popover'

interface Measurement {
  id: string
  direction: boolean
  length: string // Keep as string for input display
  remainder: number
  isGood: boolean
  label: string
}

const STORAGE_KEY = 'plank-incrementor-state'

interface StoredState {
  plankWidth: number
  minPlankWidth: number
  adjustmentAmount: number
  measurements: Measurement[]
  totalOffset: number
}

const NewPlankIncrementor = () => {
  const [plankWidth, setPlankWidth] = useState(7.25)
  const [minPlankWidth, setMinPlankWidth] = useState(2)
  const [adjustmentAmount, setAdjustmentAmount] = useState(0.25)
  const [measurements, setMeasurements] = useState<Measurement[]>([
    {
      id: '1',
      direction: true,
      length: '',
      remainder: 0,
      isGood: true,
      label: '',
    },
  ])
  const [totalOffset, setTotalOffset] = useState(0)
  const [showGeneratePopover, setShowGeneratePopover] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const state: StoredState = JSON.parse(stored)
        setPlankWidth(state.plankWidth)
        setMinPlankWidth(state.minPlankWidth)
        setAdjustmentAmount(state.adjustmentAmount)
        setMeasurements(state.measurements)
        setTotalOffset(state.totalOffset)
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state: StoredState = {
      plankWidth,
      minPlankWidth,
      adjustmentAmount,
      measurements,
      totalOffset,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [plankWidth, minPlankWidth, adjustmentAmount, measurements, totalOffset])

  // Recalculate remainder for a single measurement
  const calculateRemainder = (length: number): number => {
    const rawRemainder = length / plankWidth - Math.floor(length / plankWidth)
    return rawRemainder * plankWidth
  }

  const isRemainderGood = (remainder: number): boolean => {
    return remainder >= minPlankWidth
  }

  const incrementLabel = (label: string): string => {
    // Find the last number in the label
    const match = label.match(/(\d+)(?!.*\d)/)
    if (match) {
      const lastNumber = parseInt(match[0])
      return label.replace(/(\d+)(?!.*\d)/, (lastNumber + 1).toString())
    }
    return label ? `${label} 1` : ''
  }

  // Recalculate all remainders when plankWidth changes
  useEffect(() => {
    setMeasurements((prev) =>
      prev.map((item) => {
        const remainder = calculateRemainder(parseFloat(item.length) || 0)
        return {
          ...item,
          remainder,
          isGood: isRemainderGood(remainder),
        }
      })
    )
  }, [plankWidth, minPlankWidth])

  const handleLengthChange = (id: string, value: string) => {
    // Allow valid decimal input including trailing dot: 1, 1., 1.5, .5
    if (value !== '' && !value.match(/^\d*\.?\d*$/)) return

    setMeasurements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              length: value, // Keep as string for display
              remainder: calculateRemainder(parseFloat(value) || 0),
              isGood: isRemainderGood(
                calculateRemainder(parseFloat(value) || 0)
              ),
            }
          : item
      )
    )
  }

  const toggleDirection = (id: string) => {
    setMeasurements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, direction: !item.direction } : item
      )
    )
  }

  const addItem = () => {
    const newId = `${Date.now()}`
    const lastDirection =
      measurements.length > 0
        ? measurements[measurements.length - 1].direction
        : true
    const lastLabel =
      measurements.length > 0 ? measurements[measurements.length - 1].label : ''
    const newLabel = lastLabel ? incrementLabel(lastLabel) : ''
    setMeasurements((prev) => [
      ...prev,
      {
        id: newId,
        direction: lastDirection,
        length: '',
        remainder: 0,
        isGood: true,
        label: newLabel,
      },
    ])
  }

  const addBasicItem = () => {
    const newId = `${Date.now()}`
    setMeasurements((prev) => [
      ...prev,
      {
        id: newId,
        direction: true,
        length: '',
        remainder: 0,
        isGood: true,
        label: '',
      },
    ])
  }

  const removeItem = (id: string) => {
    setMeasurements((prev) => {
      if (prev.length === 1) {
        return [
          {
            id: '1',
            direction: true,
            length: '',
            remainder: 0,
            isGood: true,
            label: '',
          },
        ]
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearItems = () => {
    setMeasurements([
      {
        id: '1',
        direction: true,
        length: '',
        remainder: 0,
        isGood: true,
        label: '',
      },
    ])
    setTotalOffset(0)
  }

  const adjustLengths = (isAdding: boolean) => {
    setMeasurements((prev) =>
      prev.map((item) => {
        const delta = isAdding ? adjustmentAmount : -adjustmentAmount
        const currentLength = parseFloat(item.length) || 0
        const newLength = Math.max(0, currentLength + delta)
        const remainder = calculateRemainder(newLength)
        return {
          ...item,
          length: newLength.toString(),
          remainder,
          isGood: isRemainderGood(remainder),
        }
      })
    )

    setTotalOffset(
      (prev) => prev + (isAdding ? adjustmentAmount : -adjustmentAmount)
    )
  }

  const generateRandomMeasurements = () => {
    const locations = ['Room', 'Hallway', 'Door', 'Corner', 'Appliance']
    const newMeasurements: Measurement[] = []
    for (let i = 0; i < 20; i++) {
      const randomLength = parseFloat(
        (plankWidth * (Math.random() * 29 + 1)).toFixed(2)
      )
      const randomDirection = Math.random() > 0.5
      const remainder = calculateRemainder(randomLength)
      const randomLabel = `${locations[Math.floor(Math.random() * locations.length)]} ${i + 1}`
      newMeasurements.push({
        id: `${Date.now()}-${i}`,
        direction: randomDirection,
        length: randomLength.toString(),
        remainder,
        isGood: isRemainderGood(remainder),
        label: randomLabel,
      })
    }
    setMeasurements(newMeasurements)
    setTotalOffset(0)
    setShowGeneratePopover(false)
  }

  const hasExistingData = measurements.some((m) => m.length > 0)

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Plank Incrementor</CardTitle>
            <CardDescription>
              All measurements in decimal inches. Use a laser for accuracy!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Material and Threshold Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plankWidth">Material Width</Label>
                <Input
                  id="plankWidth"
                  type="number"
                  step="0.01"
                  value={plankWidth}
                  onChange={(e) =>
                    setPlankWidth(
                      Math.max(Number(e.target.value), minPlankWidth)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPlankWidth">Threshold</Label>
                <Input
                  id="minPlankWidth"
                  type="number"
                  step="0.01"
                  value={minPlankWidth}
                  onChange={(e) => setMinPlankWidth(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Total Offset Display */}
            <div className="rounded-lg bg-slate-200 dark:bg-slate-400 p-4">
              <div className="text-lg font-medium text-gray-600 flex items-center justify-between mb-3">
                <span>Line Adjustment</span>
                <Button
                  onClick={() => {
                    // Revert measurements by subtracting totalOffset
                    setMeasurements((prev) =>
                      prev.map((item) => {
                        const currentLength = parseFloat(item.length) || 0
                        const originalLength = Math.max(
                          0,
                          currentLength - totalOffset
                        )
                        const remainder = calculateRemainder(originalLength)
                        return {
                          ...item,
                          length: originalLength.toString(),
                          remainder,
                          isGood: isRemainderGood(remainder),
                        }
                      })
                    )
                    setTotalOffset(0)
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Reset
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => adjustLengths(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                >
                  ← Move Left
                </Button>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {Math.abs(totalOffset).toFixed(2)}"
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {totalOffset > 0
                      ? 'Moved left'
                      : totalOffset < 0
                        ? 'Moved right'
                        : 'No adjustment'}
                  </div>
                </div>
                <Button
                  onClick={() => adjustLengths(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                >
                  Move Right →
                </Button>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div className="space-y-2">
              <Label htmlFor="adjustmentAmount">Move Line By (inches)</Label>
              <div className="flex gap-1 items-center">
                <Button
                  onClick={() =>
                    setAdjustmentAmount(Math.max(0, adjustmentAmount - 0.25))
                  }
                  variant="outline"
                  size="sm"
                  className="h-10 w-16 flex-shrink-0"
                >
                  − 0.25
                </Button>
                <Input
                  id="adjustmentAmount"
                  type="number"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) =>
                    setAdjustmentAmount(parseFloat(e.target.value) || 0)
                  }
                  className="flex-1"
                />
                <Button
                  onClick={() => setAdjustmentAmount(adjustmentAmount + 0.25)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-16 flex-shrink-0"
                >
                  + 0.25
                </Button>
              </div>
            </div>

            {/* Measurements List */}
            <div className="space-y-1 border-t pt-3">
              <div className="font-medium text-sm text-gray-700 flex justify-between items-center">
                <span>Measurements</span>
                <span className="text-xs font-normal text-gray-600">
                  <span className="text-emerald-600 font-semibold">
                    {measurements.filter((m) => m.isGood).length}
                  </span>{' '}
                  good,{' '}
                  <span className="text-amber-600 font-semibold">
                    {measurements.filter((m) => !m.isGood).length}
                  </span>{' '}
                  careful
                </span>
              </div>
              {measurements.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 justify-stretch rounded-lg border p-1"
                >
                  <Input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) =>
                      setMeasurements((prev) =>
                        prev.map((m) =>
                          m.id === item.id ? { ...m, label: e.target.value } : m
                        )
                      )
                    }
                    placeholder="Room, Hallway 2, Door 3"
                    className="flex-1 h-8 text-xs"
                  />
                  <Input
                    type="text"
                    value={item.length}
                    onChange={(e) =>
                      handleLengthChange(item.id, e.target.value)
                    }
                    placeholder="0.00"
                    className="max-w-20 h-8 flex-shrink-0"
                  />
                  <Button
                    onClick={() => toggleDirection(item.id)}
                    className={`${
                      item.direction
                        ? 'bg-blue-500 hover:bg-blue-700'
                        : 'bg-purple-500 hover:bg-purple-700'
                    } text-white h-8 px-4`}
                    size="sm"
                  >
                    {item.direction ? '← | L' : 'R | →'}
                  </Button>
                  <div
                    className={`px-3 py-1 rounded font-semibold text-sm text-white flex-shrink-0 ${
                      item.isGood ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  >
                    {item.remainder.toFixed(2)}
                  </div>
                  <Button
                    onClick={() => removeItem(item.id)}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-between">
              <Popover
                open={showGeneratePopover}
                onOpenChange={setShowGeneratePopover}
              >
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Generate Random Measurements
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        Generate 20 Random Measurements?
                      </h4>
                      {hasExistingData && (
                        <p className="text-sm text-amber-600">
                          ⚠️ You have existing data that will be overwritten.
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        This will create random measurements ranging from{' '}
                        {(plankWidth * 1).toFixed(2)}" to{' '}
                        {(plankWidth * 30).toFixed(2)}" with random left/right
                        directions.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowGeneratePopover(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button onClick={generateRandomMeasurements} size="sm">
                        Generate
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex gap-2">
                <Button onClick={clearItems} variant="outline">
                  Clear All
                </Button>
                <Button onClick={addItem} variant="default">
                  Add Smart Item
                </Button>
                <Button onClick={addBasicItem} variant="outline">
                  Add Item
                </Button>
              </div>
            </div>

            {/* Information Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      Start by snapping an initial line and label the left/right
                      sides
                    </li>
                    <li>
                      Choose a starting point along the line as your reference
                    </li>
                    <li>
                      Take measurements from your starting point to termination
                      points along the line
                    </li>
                    <li>
                      Mark each measurement on the appropriate left or right
                      side with a laser
                    </li>
                    <li>
                      Enter measurements and adjust the line position to account
                      for material waste
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="glossary">
                <AccordionTrigger>Glossary</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Material Width:</span>
                    <p className="text-gray-600">
                      The usable width of your material (e.g., 7.25" for
                      standard plank)
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Threshold:</span>
                    <p className="text-gray-600">
                      Minimum remainder length; remainders below this trigger a
                      warning
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Remainder:</span>
                    <p className="text-gray-600">
                      Leftover material after cutting a measurement from the
                      material width
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Line Adjustment:</span>
                    <p className="text-gray-600">
                      Total distance the line has been moved left or right to
                      minimize waste
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="about">
                <AccordionTrigger>About</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <p>
                    The Plank Incrementor helps contractors optimize cutting
                    layouts by calculating remainders and tracking line
                    adjustments to minimize material waste.
                  </p>
                  <p>
                    Your data is automatically saved locally, so your
                    measurements persist between sessions.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewPlankIncrementor
