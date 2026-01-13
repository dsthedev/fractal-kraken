import { render } from '@redwoodjs/testing/web'

import StepRollCalc from './StepRollCalc'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('StepRollCalc', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<StepRollCalc />)
    }).not.toThrow()
  })
})
