import { render } from '@cedarjs/testing/web'

import QuickAddTag from './QuickAddTag'

//   Improve this test with help from the CedarJS Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('QuickAddTag', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<QuickAddTag />)
    }).not.toThrow()
  })
})
