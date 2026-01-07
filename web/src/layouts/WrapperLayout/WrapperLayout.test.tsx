import { render } from '@cedarjs/testing/web'

import WrapperLayout from './WrapperLayout'

//   Improve this test with help from the Redwood Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('WrapperLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<WrapperLayout />)
    }).not.toThrow()
  })
})
