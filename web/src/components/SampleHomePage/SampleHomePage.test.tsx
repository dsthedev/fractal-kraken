import { render } from '@cedarjs/testing/web'

import SampleHomePage from './SampleHomePage'

//   Improve this test with help from the CedarJS Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('SampleHomePage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<SampleHomePage />)
    }).not.toThrow()
  })
})
