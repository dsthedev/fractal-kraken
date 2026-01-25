import { render } from '@cedarjs/testing/web'

import GettingStartedPage from './GettingStartedPage'

//   Improve this test with help from the CedarJS Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('GettingStartedPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<GettingStartedPage />)
    }).not.toThrow()
  })
})
