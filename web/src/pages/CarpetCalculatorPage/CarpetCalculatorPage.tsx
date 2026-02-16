// import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import CarpetCalculatorV1 from 'src/components/CarpetCalculatorV1/CarpetCalculatorV1'

const CarpetCalculatorPage = () => {
  return (
    <>
      <Metadata
        title="Carpet Calculator"
        description="Carpet Calculator page"
      />

      <h1 className="text-2xl font-bold mx-auto my-4">Carpet Calculator</h1>
      <div className="hidden">
        <p>
          Going beyond a simple list of cuts. This tool is designed to help plan
          out your carpet layout for larger jobs more efficiently.
        </p>
        <h2>Feature Overview</h2>
        <ul>
          <li>Add an Area, like a bedroom, hallway, stairwell, etc</li>
          <li>For a given area, add the main length and width dimensions</li>
          <li>
            Next, add dimensions of additional features in the area that require
            fill pieces, such as closets or alcoves.
          </li>
          <li>
            The tool should calculate the main piece based on nap direction, if
            there's cutoff pieces from it, and if additional fill pieces are
            needed.
          </li>
        </ul>
      </div>

      <CarpetCalculatorV1 />
    </>
  )
}

export default CarpetCalculatorPage
