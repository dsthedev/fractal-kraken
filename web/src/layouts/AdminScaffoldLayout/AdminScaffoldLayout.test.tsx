import { render } from '@cedarjs/testing/web'

import AdminScaffoldLayout from './AdminScaffoldLayout'

//   Improve this test with help from the Redwood Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('AdminScaffoldLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminScaffoldLayout />)
    }).not.toThrow()
  })
})
