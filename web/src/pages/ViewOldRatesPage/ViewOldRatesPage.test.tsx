import { render } from '@cedarjs/testing/web'

import ViewOldRatesPage from './ViewOldRatesPage'

//   Improve this test with help from the CedarJS Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('ViewOldRatesPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ViewOldRatesPage />)
    }).not.toThrow()
  })
})
