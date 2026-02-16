import { render } from '@cedarjs/testing/web'

import CarpetCalculatorV1 from './CarpetCalculatorV1'

//   Improve this test with help from the CedarJS Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('CarpetCalculatorV1', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<CarpetCalculatorV1 />)
    }).not.toThrow()
  })
})
