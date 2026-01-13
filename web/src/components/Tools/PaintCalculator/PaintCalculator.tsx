import React, { useEffect, useState } from 'react'

const PaintCalculator = () => {
  const [length, setLength] = useState('1')
  const [width, setWidth] = useState('1')
  const [gallonCoverage, setGallonCoverage] = useState('350')
  const [gallonsNeeded, setGallonsNeeded] = useState(0)
  const [squareFeet, setSquareFeet] = useState(1)

  useEffect(() => {
    calculateGallonsNeeded()
  }, [length, width, gallonCoverage])

  const calculateGallonsNeeded = () => {
    const area = parseFloat(length) * parseFloat(width)
    const gallons = Math.ceil(area / parseFloat(gallonCoverage)) // Round up to the next gallon
    setSquareFeet(area)
    setGallonsNeeded(gallons)
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    if (id === 'length') {
      setLength(value)
    } else if (id === 'width') {
      setWidth(value)
    } else if (id === 'gallonCoverage') {
      setGallonCoverage(value)
    }
  }

  return (
    <div className="mx-auto my-6 max-w-xl text-center">
      <h2 className="grenze-gotisch mb-4 text-2xl text-3xl font-bold">
        Paint Calculator
      </h2>
      <hr className="m-4" />
      <p className="my-4 text-xs">Enther the dimensions of the room:</p>
      <div className="mb-4 flex flex-row justify-center space-x-4">
        <div className="">
          <label htmlFor="length" className="mb-2 block">
            Length <small className="text-xs">(ft)</small>:
          </label>
          <input
            type="number"
            id="length"
            value={length}
            onChange={handleInputChange}
            className="w-40 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="">
          <label htmlFor="width" className="mb-2 block">
            Width <small className="text-xs">(ft)</small>:
          </label>
          <input
            type="number"
            id="width"
            value={width}
            onChange={handleInputChange}
            className="w-40 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="gallonCoverage" className="mb-2 block">
          Gallon Coverage <small className="text-xs">(sqft)</small>:
        </label>
        <input
          type="number"
          id="gallonCoverage"
          value={gallonCoverage}
          onChange={handleInputChange}
          className="w-32 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="text-xl">
        <p className="mb-4">
          You need{' '}
          <strong className="grenze-gotisch text-4xl">{gallonsNeeded}</strong>{' '}
          gallons to cover{' '}
          <strong className="grenze-gotisch text-4xl">{squareFeet}</strong>{' '}
          square feet.
        </p>
      </div>
    </div>
  )
}

export default PaintCalculator
