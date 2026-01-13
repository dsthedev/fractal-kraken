import { useState, useEffect } from 'react'

const PlankIncrementor = () => {
  const [plankWidth, setPlankWidth] = useState(7.25)
  const [minPlankWidth, setMinPlankWidth] = useState(2)
  const [adjustmentAmount, setAdjustmentAmount] = useState(0.25) // New state for adjustment amount
  const [measurements, setMeasurements] = useState([
    { direction: true, length: 0, remainder: 0 },
  ])
  const [totalOffset, setTotalOffset] = useState(0)

  // Function to recalculate remainders
  const recalculateRemainders = () => {
    const updatedMeasurements = measurements.map((item) => {
      const parsedLength = parseFloat(item.length) || 0
      const rawRemainder =
        parsedLength / plankWidth - Math.floor(parsedLength / plankWidth)
      return { ...item, remainder: rawRemainder * plankWidth }
    })
    // Use a functional update to avoid dependency on `measurements`
    setMeasurements((currentMeasurements) => updatedMeasurements)
  }

  useEffect(() => {
    recalculateRemainders()
  }, [plankWidth]) // Only re-run the effect if plankWidth changes

  const handleLengthChange = (index, event) => {
    const value = event.target.value
    // Check if the last character is a decimal point or if there's a decimal followed by numbers
    if (value.match(/^\d*\.?\d*$/)) {
      const updatedMeasurements = measurements.map((item, i) => {
        if (i === index) {
          // Only parse the length as a float for calculations, not for setting the state
          const length = value === '' ? 0 : value // Keep as string for input display
          const parsedLength = parseFloat(length) || 0
          const rawRemainder =
            parsedLength / plankWidth - Math.floor(parsedLength / plankWidth)
          return { ...item, length, remainder: rawRemainder * plankWidth }
        }
        return item
      })
      setMeasurements(updatedMeasurements)
    }
  }

  const toggleDirection = (index) => {
    const updatedMeasurements = measurements.map((item, i) => {
      if (i === index) {
        return { ...item, direction: !item.direction }
      }
      return item
    })
    setMeasurements(updatedMeasurements)
  }

  const addItem = () => {
    setMeasurements([
      ...measurements,
      { direction: true, length: 0, remainder: 0 },
    ])
  }

  const removeItem = (index) => {
    if (measurements.length === 1) {
      setMeasurements([{ direction: true, length: 0, remainder: 0 }])
    } else {
      const updatedMeasurements = measurements.filter((_, i) => i !== index)
      setMeasurements(updatedMeasurements)
    }
  }

  const clearItems = () => {
    setMeasurements([{ direction: true, length: 0, remainder: 0 }])
    setTotalOffset(0)
  }

  const adjustLengths = (isAdding) => {
    const updatedMeasurements = measurements.map((item) => {
      // Correctly compute the delta based on direction and whether we're adding or subtracting.
      const delta =
        item.direction === isAdding ? adjustmentAmount : -adjustmentAmount
      // Ensure currentLength is a number to correctly apply the delta.
      const currentLength = parseFloat(item.length)
      const newLength = currentLength + delta

      // Recalculate the remainder based on the new length
      const rawRemainder =
        newLength / plankWidth - Math.floor(newLength / plankWidth)
      return {
        ...item,
        length: newLength,
        remainder: rawRemainder * plankWidth,
      }
    })

    setMeasurements(updatedMeasurements)

    // Update the totalOffset by adding or subtracting the adjustmentAmount,
    // regardless of the number of items or their direction.
    setTotalOffset(
      (prevTotalOffset) =>
        prevTotalOffset + (isAdding ? adjustmentAmount : -adjustmentAmount)
    )
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-xl justify-center space-y-4 text-center text-xl">
        <p className="p-4 text-xs">
          All measurements are in decimal inches, use a laser!
        </p>
        <div className="mb-4 flex justify-center gap-4">
          <div>
            <label htmlFor="plankWidth" className="block text-sm">
              Material
            </label>
            <input
              id="plankWidth"
              type="number"
              value={plankWidth}
              onChange={(e) =>
                setPlankWidth(Math.max(Number(e.target.value), minPlankWidth))
              }
              className="mt-1 block w-full max-w-32 rounded-md border border-gray-300 px-3 py-2 text-2xl shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="minPlankWidth" className="block text-sm">
              Threshold
            </label>
            <input
              id="minPlankWidth"
              type="number"
              value={minPlankWidth}
              onChange={(e) => setMinPlankWidth(Number(e.target.value))}
              className="mt-1 block w-full max-w-32 rounded-md border border-gray-300 px-3 py-2 text-2xl shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <div>
            Total Offset: <br />
            <span
              className={
                'grenze-gotisch mr-4 px-2 pb-1 text-xl ' +
                (totalOffset > 0
                  ? 'bg-slate-300 text-slate-600'
                  : 'bg-slate-600 text-slate-300')
              }
            >
              {totalOffset > 0 ? '←' : '→'}
            </span>
            <span className="grenze-gotisch text-5xl">
              {totalOffset.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <button
            className="rounded bg-lime-700 px-4 py-2 text-lg text-white"
            onClick={() => adjustLengths(true)}
          >
            ←
          </button>
          <label
            htmlFor="adjustmentAmount"
            className="block text-sm font-medium text-gray-700"
          >
            <span className="hidden">Adjustment Amount</span>
            <input
              id="adjustmentAmount"
              type="number"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value))}
              className="mt-1 block w-full max-w-24 rounded-md border border-gray-300 px-3 py-2 text-xl shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </label>
          <button
            className="rounded bg-slate-700 px-4 py-2 text-lg text-white"
            onClick={() => adjustLengths(false)}
          >
            →
          </button>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="rounded bg-orange-700 px-4 py-2 text-sm text-white"
            onClick={clearItems}
          >
            Clear Items
          </button>
          <button
            className="rounded bg-indigo-700 px-4 py-2 text-sm text-white"
            onClick={addItem}
          >
            Add Item
          </button>
        </div>
        {measurements.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <button
              className="rounded bg-red-500 px-2 py-1 text-sm text-white"
              onClick={() => removeItem(index)}
            >
              &times;
            </button>
            <span
              className={
                'grenze-gotisch px-4 pb-2 text-2xl ' +
                (item.direction
                  ? 'bg-slate-300 text-slate-600'
                  : 'bg-slate-600 text-slate-300')
              }
              onClick={() => toggleDirection(index)}
            >
              {item.direction ? '←' : '→'}
            </span>
            <input
              className="max-w-24 rounded border-2 border-gray-300 px-4 py-2 text-xl"
              type="text"
              value={item.length}
              onChange={(event) => handleLengthChange(index, event)}
            />
            <span
              className={`rounded px-4 py-2 ${
                item.remainder < minPlankWidth
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              } text-white`}
            >
              {item.remainder.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-end space-x-2">
          <button
            className="rounded bg-orange-700 px-4 py-2 text-sm text-white"
            onClick={clearItems}
          >
            Clear Items
          </button>
          <button
            className="rounded bg-indigo-700 px-4 py-2 text-sm text-white"
            onClick={addItem}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlankIncrementor
