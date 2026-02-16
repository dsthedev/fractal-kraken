import { useState, useEffect, useCallback, useMemo } from 'react'

import PlankIncrementorVisualizer from 'src/components/Tools/PlankIncrementor/PlankIncrementorVisualizer'
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
  isLeft: boolean
  length: string
  remainder: number
  isGood: boolean
  label: string
}

interface StoredState {
  plankWidth: number
  minPlankWidth: number
  adjustmentAmount: number
  measurements: Measurement[]
  totalOffset: number
}

interface SuggestedAdjustment {
  adjustment: number
  goodCount: number
  totalMeasurements: number
}

const STORAGE_KEY = 'plank-incrementor-state'
const DECIMAL_PRECISION = 3

// Pure utility functions (extracted outside component)
const calculateRemainder = (length: number, plankWidth: number): number => {
  const rawRemainder = length / plankWidth - Math.floor(length / plankWidth)
  return rawRemainder * plankWidth
}

const isRemainderGood = (remainder: number, minPlankWidth: number): boolean => {
  return remainder >= minPlankWidth
}

const decimalToImperial = (decimal: number): string => {
  const sixteenths = Math.ceil(decimal * 16)
  const inches = Math.floor(sixteenths / 16)
  const remainder = sixteenths % 16

  if (remainder === 0) return `${inches}"`
  if (remainder === 8) return inches === 0 ? `1/2"` : `${inches} 1/2"`
  if (remainder === 4 || remainder === 12) {
    const quarters = remainder / 4
    return inches === 0 ? `${quarters}/4"` : `${inches} ${quarters}/4"`
  }
  if (
    remainder === 2 ||
    remainder === 6 ||
    remainder === 10 ||
    remainder === 14
  ) {
    const eighths = remainder / 2
    return inches === 0 ? `${eighths}/8"` : `${inches} ${eighths}/8"`
  }
  return inches === 0 ? `${remainder}/16"` : `${inches} ${remainder}/16"`
}

const incrementLabel = (label: string): string => {
  const match = label.match(/(\d+)(?!.*\d)/)
  if (match) {
    const lastNumber = parseInt(match[0])
    return label.replace(/(\d+)(?!.*\d)/, (lastNumber + 1).toString())
  }
  return label ? `${label} 1` : ''
}

const isValidDecimalInput = (value: string): boolean => {
  return value === '' || /^\d*\.?\d*$/.test(value)
}

const formatLength = (value: number): string => {
  return value.toFixed(DECIMAL_PRECISION)
}

const getNewMeasurementWithCalculations = (
  item: Measurement,
  length: string,
  plankWidth: number,
  minPlankWidth: number
): Measurement => {
  const numLength = parseFloat(length) || 0
  const remainder = calculateRemainder(numLength, plankWidth)
  return {
    ...item,
    length,
    remainder,
    isGood: isRemainderGood(remainder, minPlankWidth),
  }
}

const adjustMeasurementByDelta = (
  item: Measurement,
  delta: number,
  plankWidth: number,
  minPlankWidth: number
): Measurement => {
  const currentLength = parseFloat(item.length) || 0
  // Apply delta based on direction:
  // - LEFT (isLeft=true): subtract delta (moving right decreases left measurements)
  // - RIGHT (isLeft=false): add delta (moving right increases right measurements)
  let newLength = item.isLeft ? currentLength - delta : currentLength + delta
  let newIsLeft = item.isLeft

  // If negative, flip direction and use absolute value
  if (newLength < 0) {
    newIsLeft = !newIsLeft
    newLength = Math.abs(newLength)
  }

  const remainder = calculateRemainder(newLength, plankWidth)
  return {
    ...item,
    length: formatLength(newLength),
    isLeft: newIsLeft,
    remainder,
    isGood: isRemainderGood(remainder, minPlankWidth),
  }
}

const NewPlankIncrementor = () => {
  const [plankWidth, setPlankWidth] = useState(7.25)
  const [minPlankWidth, setMinPlankWidth] = useState(2)
  const [adjustmentAmount, setAdjustmentAmount] = useState(0.25)
  const [measurements, setMeasurements] = useState<Measurement[]>([
    {
      id: '1',
      isLeft: true,
      length: '',
      remainder: 0,
      isGood: true,
      label: '',
    },
  ])
  const [totalOffset, setTotalOffset] = useState(0)
  const [showGeneratePopover, setShowGeneratePopover] = useState(false)
  const [showAutoAdjustPopover, setShowAutoAdjustPopover] = useState(false)
  const [useImperial, setUseImperial] = useState(true)
  const [suggestedAdjustment, setSuggestedAdjustment] =
    useState<SuggestedAdjustment | null>(null)

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

  // Recalculate all remainders when plankWidth or minPlankWidth changes
  useEffect(() => {
    setMeasurements((prev) =>
      prev.map((item) =>
        getNewMeasurementWithCalculations(
          item,
          item.length,
          plankWidth,
          minPlankWidth
        )
      )
    )
  }, [plankWidth, minPlankWidth])

  const handleLengthChange = useCallback(
    (id: string, value: string) => {
      if (!isValidDecimalInput(value)) return

      setMeasurements((prev) =>
        prev.map((item) =>
          item.id === id
            ? getNewMeasurementWithCalculations(
                item,
                value,
                plankWidth,
                minPlankWidth
              )
            : item
        )
      )
    },
    [plankWidth, minPlankWidth]
  )

  const toggleDirection = useCallback((id: string) => {
    setMeasurements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLeft: !item.isLeft } : item
      )
    )
  }, [])

  const addItem = useCallback(() => {
    const newId = String(Date.now())
    const lastIsLeft =
      measurements.length > 0
        ? measurements[measurements.length - 1].isLeft
        : true
    const lastLabel =
      measurements.length > 0 ? measurements[measurements.length - 1].label : ''

    setMeasurements((prev) => [
      ...prev,
      {
        id: newId,
        isLeft: lastIsLeft,
        length: '',
        remainder: 0,
        isGood: true,
        label: lastLabel ? incrementLabel(lastLabel) : '',
      },
    ])
  }, [measurements])

  const addBasicItem = useCallback(() => {
    const newId = String(Date.now())
    setMeasurements((prev) => [
      ...prev,
      {
        id: newId,
        isLeft: true,
        length: '',
        remainder: 0,
        isGood: true,
        label: '',
      },
    ])
  }, [])

  const removeItem = useCallback((id: string) => {
    setMeasurements((prev) => {
      if (prev.length === 1) {
        return [
          {
            id: '1',
            isLeft: true,
            length: '',
            remainder: 0,
            isGood: true,
            label: '',
          },
        ]
      }
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  const clearItems = useCallback(() => {
    setMeasurements([
      {
        id: '1',
        isLeft: true,
        length: '',
        remainder: 0,
        isGood: true,
        label: '',
      },
    ])
    setTotalOffset(0)
  }, [])

  const adjustLengths = useCallback(
    (isAdding: boolean) => {
      const delta = isAdding ? adjustmentAmount : -adjustmentAmount

      setMeasurements((prev) =>
        prev.map((item) =>
          adjustMeasurementByDelta(item, delta, plankWidth, minPlankWidth)
        )
      )

      setTotalOffset((prev) => prev + delta)
    },
    [adjustmentAmount, plankWidth, minPlankWidth]
  )

  const resetOffset = useCallback(() => {
    setMeasurements((prev) =>
      prev.map((item) => {
        // Subtract the offset, allowing for direction flip
        const originalDelta = -totalOffset
        return adjustMeasurementByDelta(
          item,
          originalDelta,
          plankWidth,
          minPlankWidth
        )
      })
    )
    setTotalOffset(0)
  }, [totalOffset, plankWidth, minPlankWidth])

  const generateRandomMeasurements = useCallback(() => {
    const locations = ['Room', 'Hallway', 'Door', 'Corner', 'Appliance']
    const newMeasurements: Measurement[] = []

    for (let i = 0; i < 10; i++) {
      const randomLength = parseFloat(
        (plankWidth * (Math.random() * 19 + 1)).toFixed(DECIMAL_PRECISION)
      )
      const randomDirection = Math.random() > 0.5
      const remainder = calculateRemainder(randomLength, plankWidth)
      const randomLabel = `${locations[Math.floor(Math.random() * locations.length)]} ${i + 1}`

      newMeasurements.push({
        id: `${Date.now()}-${i}`,
        isLeft: randomDirection,
        length: randomLength.toString(),
        remainder,
        isGood: isRemainderGood(remainder, minPlankWidth),
        label: randomLabel,
      })
    }

    setMeasurements(newMeasurements)
    setTotalOffset(0)
    setShowGeneratePopover(false)
  }, [plankWidth, minPlankWidth])

  const findBestAdjustment = useCallback(() => {
    let bestAdjustment = 0
    let bestGoodCount = measurements.filter((m) => m.isGood).length

    // Test adjustments from -plankWidth to +plankWidth in 0.01" increments
    for (let adj = -plankWidth; adj <= plankWidth; adj += 0.01) {
      let goodCount = 0

      for (const measurement of measurements) {
        const currentLength = parseFloat(measurement.length) || 0
        if (currentLength === 0) continue

        // Apply delta based on direction
        let testLength = measurement.isLeft
          ? currentLength - adj
          : currentLength + adj

        // Account for direction flipping if negative
        if (testLength < 0) {
          testLength = Math.abs(testLength)
        }

        const remainder = calculateRemainder(testLength, plankWidth)
        if (isRemainderGood(remainder, minPlankWidth)) {
          goodCount++
        }
      }

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
  }, [measurements, plankWidth, minPlankWidth])

  const applyBestAdjustment = useCallback(() => {
    if (!suggestedAdjustment) return

    setMeasurements((prev) =>
      prev.map((item) =>
        adjustMeasurementByDelta(
          item,
          suggestedAdjustment.adjustment,
          plankWidth,
          minPlankWidth
        )
      )
    )

    setTotalOffset((prev) => prev + suggestedAdjustment.adjustment)
    setShowAutoAdjustPopover(false)
    setSuggestedAdjustment(null)
  }, [suggestedAdjustment, plankWidth, minPlankWidth])

  const hasExistingData = useMemo(
    () => measurements.some((m) => m.length !== ''),
    [measurements]
  )

  const goodCount = useMemo(
    () => measurements.filter((m) => m.isGood).length,
    [measurements]
  )

  const badCount = useMemo(
    () => measurements.filter((m) => !m.isGood).length,
    [measurements]
  )

  const goodBadCountDisplay = useMemo(
    () => (
      <span className="text-sm block font-normal text-gray-600">
        <span className="text-emerald-600 font-semibold">{goodCount}</span>{' '}
        good, <span className="text-amber-600 font-semibold">{badCount}</span>{' '}
        careful
      </span>
    ),
    [goodCount, badCount]
  )

  const displayOffset = useImperial
    ? decimalToImperial(Math.abs(totalOffset))
    : `${Math.abs(totalOffset).toFixed(DECIMAL_PRECISION)}"`

  const offsetDirection =
    totalOffset > 0 ? 'Left' : totalOffset < 0 ? 'Right' : 'No adjustment'
  const offsetDirectionColor =
    totalOffset > 0
      ? 'text-sky-600'
      : totalOffset < 0
        ? 'text-purple-600'
        : 'text-gray-600'

  return (
    <div className="flex justify-center p-1">
      <div className="w-full max-w-3xl space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Plank Incrementor</CardTitle>
            <CardDescription className=" text-lg border-t-2 border-red-500 max-w-md w-full mx-auto mt-2 text-gray-600 pt-2">
              Use a Laser!
            </CardDescription>
            <p className="text-left text-sm text-muted-foreground">
              {
                'This tool helps to adjust where the starting line will be when laying planks. The goal is to avoid having rows be less than the minimum plank width. For example, if your last row is 1/2" it is difficult to install and may not adhere well.'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Material and Threshold Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plankWidth">Material Width</Label>
                <Input
                  id="plankWidth"
                  type="number"
                  step="0.1"
                  className="text-xl"
                  value={plankWidth}
                  onChange={(e) =>
                    setPlankWidth(
                      Math.max(Number(e.target.value), minPlankWidth)
                    )
                  }
                />
                <span className="text-sm block text-gray-500">
                  The width of the material, not the length!
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPlankWidth">Threshold</Label>
                <Input
                  id="minPlankWidth"
                  type="number"
                  step="0.25"
                  className="text-xl"
                  value={minPlankWidth}
                  onChange={(e) => setMinPlankWidth(Number(e.target.value))}
                />
                <span className="text-sm block text-gray-500">
                  Minimum acceptable width for a plank
                </span>
              </div>
            </div>

            {/* Measurements List */}
            <div className="space-y-1 border-y py-3">
              <div className="font-medium flex justify-between items-center">
                <span className="my-3">Measurements</span>
                {goodBadCountDisplay}
              </div>
              <p className="text-sm text-gray-500 pb-4">
                {`Starting from a centerline, measure outwards to each wall or termination point. It's recommended to mark measurements on left or right side accordingly. If there are multiple measurements in an area, keep them in order and label with [area & number].`}
              </p>
              {measurements.map((item) => (
                <div key={item.id} className="flex gap-2 justify-stretch">
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
                    className={`flex-1 h-8 text-xs hidden md:flex ${
                      item.isLeft
                        ? 'bg-sky-100 focus:bg-sky-50'
                        : 'bg-purple-100 focus:bg-purple-50'
                    }`}
                  />
                  <Input
                    type="text"
                    value={item.length}
                    onChange={(e) =>
                      handleLengthChange(item.id, e.target.value)
                    }
                    onBlur={() => {
                      const parsed = parseFloat(item.length)
                      if (!Number.isNaN(parsed)) {
                        setMeasurements((prev) =>
                          prev.map((m) =>
                            m.id === item.id
                              ? getNewMeasurementWithCalculations(
                                  m,
                                  formatLength(parsed),
                                  plankWidth,
                                  minPlankWidth
                                )
                              : m
                          )
                        )
                      }
                    }}
                    placeholder="0.00"
                    className="md:max-w-20 h-8 flex-1 md:flex-shrink-0 text-xl"
                  />
                  <Button
                    onClick={() => toggleDirection(item.id)}
                    className={`${
                      item.isLeft
                        ? 'bg-sky-500 hover:bg-sky-700'
                        : 'bg-purple-500 hover:bg-purple-700'
                    } text-white text-xs h-auto px-2`}
                    size="sm"
                  >
                    {item.isLeft ? '← L' : 'R →'}
                  </Button>
                  <div
                    className={`px-3 py-1 rounded font-semibold text-sm text-white text-xl flex-shrink-0 ${
                      item.isGood
                        ? 'bg-emerald-500'
                        : item.remainder <= plankWidth / 10
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                    }`}
                  >
                    {item.remainder.toFixed(DECIMAL_PRECISION)}
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
            <div className="flex my-6 md:justify-center">
              <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row">
                <Popover
                  open={showAutoAdjustPopover}
                  onOpenChange={setShowAutoAdjustPopover}
                >
                  <PopoverTrigger asChild>
                    <Button
                      onClick={findBestAdjustment}
                      variant="outline"
                      size="xl"
                      className="order-2 md:order-1 w-auto"
                    >
                      ✨ Adjust Automagically
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-3">
                      {suggestedAdjustment && (
                        <div className="rounded-lg p-3 space-y-1">
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
                <div className="flex flex-row gap-2 order-1 md:order-2 w-full md:w-auto justify-end">
                  <Button
                    onClick={clearItems}
                    variant="secondary"
                    size="sm"
                    className="w-auto bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={addBasicItem}
                    variant="secondary"
                    size="sm"
                    className="w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Item
                  </Button>
                  <Button
                    onClick={addItem}
                    variant="secondary"
                    size="lg"
                    className="w-auto bg-lime-600 hover:bg-lime-700 text-white"
                  >
                    {'+'} Smart Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Total Offset Display */}
            <div className="flex flex-col justify-center items-center gap-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => adjustLengths(true)}
                  className="bg-sky-500 hover:bg-sky-700 text-white flex-shrink-0"
                >
                  <span className="text-4xl md:text-base">←</span>
                  <span className="text-lg">1/8"</span>
                  <span className="hidden md:inline">Move Left</span>
                </Button>
                <div className="text-center">
                  <div className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {totalOffset > 0
                      ? 'Moved'
                      : totalOffset < 0
                        ? 'Move the Line'
                        : '\u00A0'}
                  </div>
                  <div className="text-4xl font-bold">{displayOffset}</div>
                  <div className="text-lg text-gray-500 mt-1">
                    <span className={`font-semibold ${offsetDirectionColor}`}>
                      {offsetDirection}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => adjustLengths(false)}
                  className="bg-purple-500 hover:bg-purple-700 text-white flex-shrink-0"
                >
                  <span className="hidden md:inline">Move Right</span>
                  <span className="text-lg">1/8"</span>
                  <span className="text-2xl md:text-base">→</span>
                </Button>
              </div>
              {goodBadCountDisplay}
              <div className="header max-w-md mx-auto">
                <h3 className="text-lg">Line Adjustment</h3>
                <p className="text-muted-foreground text-sm">
                  Adjust the line position using the arrow buttons above. Notice
                  which measurements are highlighted as{' '}
                  <span className="text-emerald-600 font-semibold">good</span>{' '}
                  or{' '}
                  <span className="text-amber-600 font-semibold">careful</span>{' '}
                  as you adjust. The goal is to find a position that maximizes
                  the number of{' '}
                  <span className="text-emerald-600 font-semibold">good</span>{' '}
                  remainders, to reduce waste and small pieces that don't hold
                  up well.
                </p>
              </div>
              <div className="flex flex-row gap-2 border-b border-gray-300 pb-8 w-full justify-center max-w-md">
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
                  Show as:{' '}
                  <strong>{useImperial ? 'Imperial' : 'Decimal'}</strong>
                </Button>
                <Button
                  onClick={resetOffset}
                  variant="destructive"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Reset Adjustment
                </Button>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div className="space-y-2 hidden">
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                By default, the move left/right buttons adjust the line by 0.25
                inches. Use these controls to change the increment amount.
              </p>
              <div className="flex gap-1 items-center justify-center">
                <Button
                  onClick={() =>
                    setAdjustmentAmount(Math.max(0, adjustmentAmount - 0.25))
                  }
                  size="sm"
                  className="py-2 px-4 text-lg"
                >
                  {'− 0.25"'}
                </Button>
                <Input
                  id="adjustmentAmount"
                  type="number"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) =>
                    setAdjustmentAmount(parseFloat(e.target.value) || 0)
                  }
                  className="flex-0 text-lg text-center min-w-40"
                />
                <Button
                  onClick={() => setAdjustmentAmount(adjustmentAmount + 0.25)}
                  size="sm"
                  className="py-2 px-4 text-lg"
                >
                  {'+ 0.25"'}
                </Button>
              </div>
              <Label
                className="inline-block w-full text-center text-xs text-gray-500"
                htmlFor="adjustmentAmount"
              >
                Increment Amount (inches)
              </Label>
            </div>

            {/* Information Accordion */}
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="visualizer"
            >
              <AccordionItem value="visualizer">
                <AccordionTrigger>Visualizer</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <PlankIncrementorVisualizer
                    measurements={measurements}
                    materialWidth={plankWidth}
                  />
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
                      The cumulative distance the line has been moved left (sky)
                      or right (purple) to optimize remainder distribution.
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">
                      Left (← | Blue) vs Right (→ | Purple):
                    </span>
                    <p className="text-gray-600">
                      Indicates which side of the centerline each measurement is
                      located. The toggle button switches direction for
                      individual measurements.
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
                        {`Tests every possible centerline adjustment from - ${plankWidth.toFixed(2)}" to +${plankWidth.toFixed(2)}" in 0.01" increments`}
                      </li>
                      <li>
                        For each adjustment, simulates how LEFT measurements
                        decrease and RIGHT measurements increase, accounting for
                        measurements that flip sides
                      </li>
                      <li>
                        Calculates which measurements would result in "good"
                        remainders (≥ threshold)
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
              <AccordionItem value="measurement-direction-flipping">
                <AccordionTrigger>Direction Flipping</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <p className="text-gray-600 text-sm">
                    Direction of a measurement is often switched while enteringn
                    measurmentes.
                  </p>
                  <p>
                    In some rare cases, the centerline is moved into or past an
                    obstacle / termination point. In this case, the measurement
                    will flip to the opposite side of the centerline and
                    continue to increase in length as you move the line in that
                    direction.
                  </p>
                  <div className="bg-slate-100 p-3 rounded space-y-2">
                    <p className="font-medium">Example:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>{'Measurement: 0.5" LEFT (←)'}</li>
                      <li>{'Move centerline right by 0.75"'}</li>
                      <li>{'Calculation: 0.5 - 0.75 = -0.25"'}</li>
                      <li>{'Result: 0.25" RIGHT (→)'}</li>
                      <li className="text-gray-600 italic">
                        {
                          'The measurement crosses the centerline and now measures 0.25" on the right'
                        }
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex my-8">
              <Popover
                open={showGeneratePopover}
                onOpenChange={setShowGeneratePopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto mx-auto text-gray-400"
                  >
                    Generate Random Measurements
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        Generate 10 Random Measurements?
                      </h4>
                      {hasExistingData && (
                        <p className="text-sm text-amber-600">
                          ⚠️ You have existing data that will be overwritten.
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        This will create random measurements ranging from{' '}
                        {(plankWidth * 1).toFixed(2)}" to{' '}
                        {(plankWidth * 20).toFixed(2)}" with random left/right
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewPlankIncrementor
