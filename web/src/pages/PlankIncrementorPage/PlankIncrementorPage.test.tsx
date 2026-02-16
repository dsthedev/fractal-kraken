import { render } from '@cedarjs/testing/web'

import PlankIncrementorPage from './PlankIncrementorPage'

//   Improve this test with help from the CedarJS Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('PlankIncrementorPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<PlankIncrementorPage />)
    }).not.toThrow()
  })
})
