import { render } from '@cedarjs/testing/web'

import CarpetCalculatorPage from './CarpetCalculatorPage'

//   Improve this test with help from the CedarJS Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('CarpetCalculatorPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<CarpetCalculatorPage />)
    }).not.toThrow()
  })
})
