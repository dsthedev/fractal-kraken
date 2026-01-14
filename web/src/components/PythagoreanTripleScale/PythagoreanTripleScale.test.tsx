import { render } from '@cedarjs/testing/web'

import PythagoreanTripleScale from './PythagoreanTripleScale'

//   Improve this test with help from the CedarJS Testing Doc:
//    https://cedarjs.com/docs/testing#testing-components

describe('PythagoreanTripleScale', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<PythagoreanTripleScale />)
    }).not.toThrow()
  })
})
