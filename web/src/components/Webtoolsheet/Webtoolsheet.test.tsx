import { render } from '@cedarjs/testing/web'

import Webtoolsheet from './Webtoolsheet'

//   Improve this test with help from the CedarJS Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('Webtoolsheet', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<Webtoolsheet />)
    }).not.toThrow()
  })
})
