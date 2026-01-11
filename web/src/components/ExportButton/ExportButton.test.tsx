import { render } from '@cedarjs/testing/web'

import ExportButton from './ExportButton'

//   Improve this test with help from the Redwood Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('ExportButton', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ExportButton />)
    }).not.toThrow()
  })
})
