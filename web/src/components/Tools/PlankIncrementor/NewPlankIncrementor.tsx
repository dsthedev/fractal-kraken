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
  const [showAutoAdjustPopover, setShowAutoAdjustPopover] = useState(false)
  const [useImperial, setUseImperial] = useState(false)
  const [suggestedAdjustment, setSuggestedAdjustment] = useState<{
    adjustment: number
    goodCount: number
    totalMeasurements: number
  } | null>(null)

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

  const decimalToImperial = (decimal: number): string => {
    const sixteenths = Math.ceil(decimal * 16)
    const inches = Math.floor(sixteenths / 16)
    const remainder = sixteenths % 16

    if (remainder === 0) {
      return `${inches}"`
    }

    // Simplify to the coarsest useful fraction
    // Check for half (8 sixteenths)
    if (remainder === 8) {
      return inches === 0 ? `1/2"` : `${inches} 1/2"`
    }

    // Check quarters (4, 12 sixteenths)
    if (remainder === 4 || remainder === 12) {
      const quarters = remainder / 4
      return inches === 0 ? `${quarters}/4"` : `${inches} ${quarters}/4"`
    }

    // Check eighths (2, 6, 10, 14 sixteenths)
    if (
      remainder === 2 ||
      remainder === 6 ||
      remainder === 10 ||
      remainder === 14
    ) {
      const eighths = remainder / 2
      return inches === 0 ? `${eighths}/8"` : `${inches} ${eighths}/8"`
    }

    // Default to sixteenths (odd numbers: 1, 3, 5, 7, 9, 11, 13, 15)
    return inches === 0 ? `${remainder}/16"` : `${inches} ${remainder}/16"`
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

  const findBestAdjustment = () => {
    // Only search within one plank width cycle (pattern repeats)
    let bestAdjustment = 0
    let bestGoodCount = measurements.filter((m) => m.isGood).length // Current state

    // Test adjustments from 0 to plankWidth in 0.01" increments
    for (let adj = 0; adj <= plankWidth; adj += 0.01) {
      let goodCount = 0

      // Count how many measurements would be good with this adjustment
      for (const measurement of measurements) {
        const currentLength = parseFloat(measurement.length) || 0
        if (currentLength === 0) continue // Skip empty measurements

        const newLength = currentLength + adj
        const remainder = calculateRemainder(newLength)
        if (isRemainderGood(remainder)) {
          goodCount++
        }
      }

      // Update best if this is better (prefer smaller adjustment on tie)
      if (goodCount > bestGoodCount) {
        bestGoodCount = goodCount
        bestAdjustment = adj
      }
    }

    setSuggestedAdjustment({
      adjustment: Math.round(bestAdjustment * 100) / 100,
      goodCount: bestGoodCount,
      totalMeasurements: measurements.filter((m) => m.length).length,
    })
    setShowAutoAdjustPopover(true)
  }

  const applyBestAdjustment = () => {
    if (!suggestedAdjustment) return

    setMeasurements((prev) =>
      prev.map((item) => {
        const currentLength = parseFloat(item.length) || 0
        const newLength = Math.max(
          0,
          currentLength + suggestedAdjustment.adjustment
        )
        const remainder = calculateRemainder(newLength)
        return {
          ...item,
          length: newLength.toString(),
          remainder,
          isGood: isRemainderGood(remainder),
        }
      })
    )

    setTotalOffset((prev) => prev + suggestedAdjustment.adjustment)
    setShowAutoAdjustPopover(false)
    setSuggestedAdjustment(null)
  }

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
                  step="0.1"
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
                  step="0.25"
                  value={minPlankWidth}
                  onChange={(e) => setMinPlankWidth(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Total Offset Display */}
            <div className="rounded-lg bg-slate-200 dark:bg-slate-400 p-4">
              <div className="text-lg font-medium text-gray-600 flex items-center justify-between mb-3">
                <span>Line Adjustment</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setUseImperial(!useImperial)}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    title={
                      useImperial
                        ? 'Show decimal inches'
                        : 'Show imperial 1/16 increments'
                    }
                  >
                    {useImperial ? '1/16' : 'Decimal'}
                  </Button>
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
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => adjustLengths(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                >
                  ← Move Left
                </Button>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mt-1">
                    {totalOffset > 0 ? 'Moved' : totalOffset < 0 ? 'Moved' : ''}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {useImperial
                      ? decimalToImperial(Math.abs(totalOffset))
                      : `${Math.abs(totalOffset).toFixed(2)}"`}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span
                      className={`font-semibold ${
                        totalOffset > 0
                          ? 'text-blue-600'
                          : totalOffset < 0
                            ? 'text-purple-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {totalOffset > 0
                        ? 'Left'
                        : totalOffset < 0
                          ? 'Right'
                          : 'No adjustment'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => adjustLengths(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                >
                  Move Right →
                </Button>
              </div>
              {/* Auto-adjust button */}
              <div className="flex justify-center mt-3">
                <Popover
                  open={showAutoAdjustPopover}
                  onOpenChange={setShowAutoAdjustPopover}
                >
                  <PopoverTrigger asChild>
                    <Button
                      onClick={findBestAdjustment}
                      variant="outline"
                      size="sm"
                    >
                      ✨ Adjust Automagically
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-medium">Optimize Line Position</h4>
                        <p className="text-xs text-gray-500">
                          This algorithm will test all possible adjustments to
                          find the position that maximizes "good" remainders (≥
                          threshold). Results are approximate and for reference
                          only.
                        </p>
                      </div>
                      {suggestedAdjustment && (
                        <div className="rounded-lg bg-slate-100 p-3 space-y-1">
                          <p className="text-sm font-semibold">
                            Suggested Adjustment:{' '}
                            {suggestedAdjustment.adjustment.toFixed(2)}"
                          </p>
                          <p className="text-sm text-gray-600">
                            Would achieve{' '}
                            <span className="font-semibold text-emerald-600">
                              {suggestedAdjustment.goodCount}
                            </span>{' '}
                            good out of{' '}
                            <span className="font-semibold">
                              {suggestedAdjustment.totalMeasurements}
                            </span>{' '}
                            measurements
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowAutoAdjustPopover(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={applyBestAdjustment}
                          size="sm"
                          disabled={!suggestedAdjustment}
                        >
                          Apply Adjustment
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                    className={`flex-1 h-8 text-xs ${
                      item.direction
                        ? 'bg-blue-100 focus:bg-blue-50'
                        : 'bg-purple-100 focus:bg-purple-50'
                    }`}
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
                      Snap an initial line and establish your reference point
                    </li>
                    <li>
                      For each termination point along the line, measure the
                      distance from your reference point in decimal inches
                    </li>
                    <li>
                      Record each measurement with its direction (left ← | blue
                      or right → | purple) relative to your reference
                    </li>
                    <li>
                      Optionally add a label (e.g., "Door 1", "Corner A") to
                      track locations
                    </li>
                    <li>
                      The tool calculates remainders for each measurement and
                      shows which are "good" (≥ threshold) or "careful" (≤
                      threshold)
                    </li>
                    <li>
                      Use the "Move Left" and "Move Right" buttons to adjust all
                      measurements at once, or try "Adjust Automagically" to
                      optimize
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
                      standard plank). This is divided by each measurement to
                      calculate the remainder.
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Threshold:</span>
                    <p className="text-gray-600">
                      Minimum acceptable remainder length. Remainders ≥
                      threshold are marked "good" (green); remainders &lt;
                      threshold are marked "careful" (orange).
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Remainder:</span>
                    <p className="text-gray-600">
                      The usable waste from cutting a measurement from your
                      material. Formula: (measurement ÷ material width - floor)
                      × material width.
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Line Adjustment:</span>
                    <p className="text-gray-600">
                      The cumulative distance the line has been moved left
                      (blue) or right (purple) to optimize remainder
                      distribution.
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">
                      Left (Blue) vs Right (Purple):
                    </span>
                    <p className="text-gray-600">
                      Indicates which side of your reference point each
                      measurement is located. The toggle button switches
                      direction for individual measurements.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="automagic">
                <AccordionTrigger>Automagic Adjustment</AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <p>
                    The "Adjust Automagically" button uses an optimization
                    algorithm to find the best line position for your
                    measurements.
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>
                        Tests every possible line adjustment from 0" to your
                        material width in 0.01" increments (roughly 725
                        adjustment points for 7.25" material)
                      </li>
                      <li>
                        For each adjustment, calculates how many of your
                        measurements would result in "good" remainders (≥
                        threshold)
                      </li>
                      <li>
                        Returns the adjustment that maximizes the number of good
                        remainders
                      </li>
                      <li>Breaks ties by preferring the smallest adjustment</li>
                    </ol>
                  </div>
                  <p className="text-gray-500 text-xs italic">
                    Note: Results are estimates based on your current
                    measurements. The algorithm assumes a repeating material
                    pattern and may not account for all real-world constraints.
                    Use as a starting point and verify manually.
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
