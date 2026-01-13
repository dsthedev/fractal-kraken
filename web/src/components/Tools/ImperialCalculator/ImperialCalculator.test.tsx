import { render } from '@redwoodjs/testing/web'

import ImperialCalculator from './ImperialCalculator'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('ImperialCalculator', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ImperialCalculator />)
    }).not.toThrow()
  })
})
