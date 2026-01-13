import { useState } from 'react'

import StepRollCalcVisualizer from '../StepRollCalcVisualizer/StepRollCalcVisualizer'

const StepRollCalc: React.FC = () => {
  const [profile, setProfile] = useState<number>(20)
  const [stepWidth, setStepWidth] = useState<number>(42)
  const [steps, setSteps] = useState<number>(13)
  const [rollWidth, setRollWidth] = useState<number>(12) // in feet
  const [showFtIn, setShowFtIn] = useState<boolean>(false) // toggle for ft/in display

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: string
  ) => {
    const intValue = parseInt(value, 10)
    if (intValue >= 0 && intValue <= 9999) {
      setter(intValue)
    }
  }

  const calculateCarpetLength = () => {
    const rollWidthInches = rollWidth * 12
    const possibleColumns = Math.floor(rollWidthInches / stepWidth)
    const stepsPerColumn = Math.ceil(steps / possibleColumns)
    const totalCarpetLength = (stepsPerColumn * profile) / 12
    return { totalCarpetLength, possibleColumns, stepsPerColumn }
  }

  const { totalCarpetLength, possibleColumns, stepsPerColumn } =
    calculateCarpetLength()

  const displayFeet = Math.floor(totalCarpetLength)
  const displayInches = Math.ceil((totalCarpetLength - displayFeet) * 12)

  const toggleProfile = (amount: number) => {
    setProfile(profile + amount)
  }

  return (
    <div>
      <h1 className="text-2xl">Step Roll Calc</h1>
      <p className="my-3 text-lg">
        Calculate how much carpet is needed to cover a set of steps.
      </p>
      <div className="flex flex-row space-x-4">
        <div id="stepCount" className="my-1">
          <label className="flex flex-col justify-center">
            <span className="py-2 font-bold">Steps:</span>
            <input
              type="number"
              onFocus={(e) => e.target.select()}
              className="max-w-28 text-right font-mono text-4xl"
              value={steps}
              onChange={(e) => handleInputChange(setSteps, e.target.value)}
            />
            <span className="text-xs">(inches)</span>
          </label>
        </div>
        <div id="stepWidth" className="my-1">
          <label className="flex flex-col justify-center">
            <span className="py-2 font-bold">Width:</span>
            <input
              type="number"
              onFocus={(e) => e.target.select()}
              className="max-w-28 text-right font-mono text-4xl"
              value={stepWidth}
              onChange={(e) => handleInputChange(setStepWidth, e.target.value)}
            />
            <span className="text-xs">(inches)</span>
          </label>
        </div>
      </div>
      <div className="flex flex-row space-x-4">
        <div id="stepProfile" className="my-1">
          <label className="flex flex-col justify-center">
            <span className="py-2 font-bold">Profile:</span>
            <input
              type="number"
              onFocus={(e) => e.target.select()}
              className="max-w-28 text-right font-mono text-4xl"
              value={profile}
              onChange={(e) => handleInputChange(setProfile, e.target.value)}
            />
            <span className="text-xs">(inches)</span>
          </label>
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => toggleProfile(-2)}
              className="border px-2 py-1"
            >
              -2"
            </button>
            <button
              onClick={() => toggleProfile(2)}
              className="border px-2 py-1"
            >
              +2"
            </button>
          </div>
        </div>
        <div id="rollWidth" className="my-1">
          <label className="flex flex-col justify-center">
            <span className="py-2 font-bold">Roll Width:</span>
            <select
              value={rollWidth}
              onChange={(e) => setRollWidth(Number(e.target.value))}
              className="max-w-28 font-mono text-4xl"
            >
              <option value={12}>12'</option>
              <option value={15}>15' ft'</option>
            </select>
          </label>
        </div>
      </div>

      <h3 className="my-4 p-3 text-5xl">
        <code className="font-serif">
          {displayFeet}
          {showFtIn ? ' ft' : "'"}, {displayInches}
          {showFtIn ? ' in' : '"'}
        </code>
      </h3>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showFtIn}
          onChange={() => setShowFtIn(!showFtIn)}
          className="hidden"
        />
        Display as{' '}
        <span className="mx-auto my-2 flex border-2 border-gray-600 border-opacity-50 p-2">
          {showFtIn ? 'Prime Symbols' : 'ft / in'}
        </span>
      </label>

      <p className="py-4">
        To get {steps} steps, a {totalCarpetLength.toFixed(2)}' foot' long roll
        of carpet is necessary. This will allow {stepsPerColumn} steps per
        column; since only {possibleColumns} columns are possible at {stepWidth}
        ".
      </p>

      <hr />
      <StepRollCalcVisualizer
        profile={profile}
        stepWidth={stepWidth}
        steps={steps}
        rollWidth={rollWidth}
      />
      <hr />

      <small className="flex max-w-sm flex-col space-y-2 p-3">
        <span>
          <strong>Notice: </strong> Typical steps have an ~18" profile. For
          installation purposes, add 2" to this measurement to allow for
          reasonable profile variance. This calculator is a reference tool only.
        </span>

        <span>
          <strong> Always: </strong> double check your numbers for using for
          estimates and invoices!
        </span>
      </small>

      <small className="mx-auto my-2 flex border-2 border-gray-600 border-opacity-50 p-2">
        Are these numbers incorrect? Please let the developer know!
      </small>
    </div>
  )
}

export default StepRollCalc
