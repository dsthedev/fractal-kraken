import { render } from '@cedarjs/testing/web'

import OrphanedBillableItemsCleanupPage from './OrphanedBillableItemsCleanupPage'

//   Improve this test with help from the CedarJS Testing Doc:
//   https://cedarjs.com/docs/testing#testing-pages-layouts

describe('OrphanedBillableItemsCleanupPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<OrphanedBillableItemsCleanupPage />)
    }).not.toThrow()
  })
})
