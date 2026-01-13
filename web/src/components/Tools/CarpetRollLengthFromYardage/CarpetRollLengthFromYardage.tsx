import { useState } from 'react'

const CarpetRollLengthFromYardage = () => {
  const [yardage, setYardage] = useState(100)
  const [rollWidth, setRollWidth] = useState(12)
  const [length, setLength] = useState(75)

  const handleYardageChange = (e) => {
    setYardage(e.target.value)
    setLength((e.target.value * 9) / rollWidth)
  }

  const handleRollWidthChange = (e) => {
    setRollWidth(parseInt(e.target.value))
    setLength((yardage * 9) / e.target.value)
  }

  return (
    <>
      <div className="my-8 flex flex-col">
        <h4 className="mb-4 p-4 text-lg">Get Roll Length from Yardage:</h4>

        <div className="flex p-4">
          <label htmlFor="forRollWidth" className="mr-4 py-2">
            Roll Width
          </label>
          <select
            name="forRollWidth"
            value={rollWidth}
            onChange={handleRollWidthChange}
            className="input px-4 text-xl"
          >
            <option value="12">{"12'"}</option>
            <option value="15">{"15'"}</option>
          </select>
        </div>

        <div className="flex p-4">
          <input
            name="totalYardage"
            className="input w-[60%] p-4 text-3xl md:w-[80%]"
            type="number"
            value={yardage}
            onChange={handleYardageChange}
            placeholder="100"
          />
          <label htmlFor="totalYardage" className="p-4 text-xl">
            Yards
          </label>
        </div>

        <hr className="my-4 border-zinc-600 p-0" />

        <div className="flex flex-col text-center">
          <h5 className="grenze-gotisch text-6xl">~{length}&apos;</h5>
        </div>
      </div>
    </>
  )
}

export default CarpetRollLengthFromYardage
