import { useEffect, useState } from 'react'

const TheCutList = ({ measurementsJson, onTotalChange }) => {
  // Parse the JSON string or use default measurements
  const [measurements, setMeasurements] = useState(
    measurementsJson ? JSON.parse(measurementsJson) : [{ feet: 0, inches: 0 }]
  )

  // State variable to hold the sum of all measurements in inches
  const [totalMeasurementInches, setTotalMeasurementInches] = useState(0)

  // State variable to hold the total yardage
  const [totalYardage, setTotalYardage] = useState(0)

  // Convert inches to feet and inches format
  const inchesToFeetInches = (inches) => {
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return { feet, inches: remainingInches }
  }

  // Convert feet and inches to total inches
  const feetInchesToInches = ({ feet, inches }) => {
    return feet * 12 + inches
  }

  // Convert total inches to total yardage
  const inchesToYardage = (inches) => {
    return ((inches / 12) * 4) / 3
  }

  // Calculate the sum of all measurements in inches
  useEffect(() => {
    const sumInches = measurements.reduce(
      (acc, curr) => acc + feetInchesToInches(curr),
      0
    )
    setTotalMeasurementInches(sumInches)
    // Pass the total back to the parent component
    if (onTotalChange) {
      onTotalChange(sumInches)
    }
  }, [measurements, onTotalChange])

  // Calculate the total yardage
  useEffect(() => {
    const yardage = inchesToYardage(totalMeasurementInches)
    setTotalYardage(yardage)
  }, [totalMeasurementInches])

  // Handler for changing a measurement value
  const handleMeasurementChange = (index, type, value) => {
    // Parse the input value
    const parsedValue = parseInt(value)

    // Check if the parsed value is a valid number
    if (!isNaN(parsedValue)) {
      // If valid, update the measurement normally
      const updatedMeasurements = [...measurements]
      updatedMeasurements[index][type] = parsedValue
      setMeasurements(updatedMeasurements)
    } else {
      // If not a valid number, set the measurement to 0
      const updatedMeasurements = [...measurements]
      updatedMeasurements[index][type] = 0
      setMeasurements(updatedMeasurements)
    }
  }

  // Handler for adding a new measurement
  const handleAddMeasurement = () => {
    setMeasurements([...measurements, { feet: 0, inches: 0 }])
  }

  // Handler for removing a measurement
  const handleRemoveMeasurement = (index) => {
    const updatedMeasurements = [...measurements]
    if (updatedMeasurements.length === 1) {
      // If it's the last measurement, set its values to 0 instead of removing it
      updatedMeasurements[index] = { feet: 0, inches: 0 }
    } else {
      updatedMeasurements.splice(index, 1)
    }
    setMeasurements(updatedMeasurements)
  }

  // Handler for key up event to remove non-numeric characters and leading zeroes
  const handleKeyUp = (e) => {
    let value = e.target.value.trim() // Remove leading and trailing whitespaces
    // Remove non-numeric characters
    value = value.replace(/\D/g, '')
    // Remove leading zeroes, except for the case when the value is '0'
    // console.log(value)
    if (value !== '0' || '') {
      value = value.replace(/^0+/, '')
    }
    e.target.value = value !== '' ? value : '0' // Ensure at least '0' is displayed if the input becomes empty
  }

  // Function to clear all measurements and leave only one item with zeroes
  const clearMeasurements = () => {
    setMeasurements([{ feet: 0, inches: 0 }])
  }

  return (
    <div className="p-4 text-center">
      <div className="grenze-gotisch mb-4 text-4xl">
        {Math.floor(totalMeasurementInches / 12)}'{totalMeasurementInches % 12}"
      </div>
      <div className="mb-4">~{totalYardage.toFixed(2)} yards</div>
      <div className="my-4 flex flex-col justify-center space-x-4 md:flex-row">
        <button
          className="w-auto rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          onClick={handleAddMeasurement}
        >
          Add Cut
        </button>
        <button
          onClick={clearMeasurements}
          className="w-auto rounded bg-gray-300 p-2 text-gray-700 hover:bg-gray-400"
        >
          Clear All
        </button>
      </div>
      <table className="table w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Feet</th>
            <th className="px-4 py-2">Inches</th>
            <th className="px-4 py-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement, index) => (
            <tr key={index} className="flesx">
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="w-20 rounded border p-1 text-3xl"
                  value={measurement.feet}
                  onChange={(e) =>
                    handleMeasurementChange(index, 'feet', e.target.value)
                  }
                  onKeyUp={handleKeyUp}
                />
              </td>
              <td className="px-4 py-2">
                <select
                  className="w-notfull w-20 rounded border p-2 text-2xl"
                  value={measurement.inches}
                  onChange={(e) =>
                    handleMeasurementChange(index, 'inches', e.target.value)
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2">
                <button
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  onClick={() => handleRemoveMeasurement(index)}
                >
                  &times;
                  <span className="hidden">Remove</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TheCutList
