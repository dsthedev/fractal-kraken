import { render } from '@redwoodjs/testing/web'

import StepRollCalcVisualizer from './StepRollCalcVisualizer'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('StepRollCalcVisualizer', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<StepRollCalcVisualizer />)
    }).not.toThrow()
  })
})
