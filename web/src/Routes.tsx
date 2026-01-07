import { Router, Route, Set } from '@cedarjs/router'

import WrapperLayout from 'src/layouts/WrapperLayout'

const Routes = () => {
  return (
    <Router>
      <Set wrap={WrapperLayout}>
        <Route path="/" page={HomePage} name="home" />

        <Route notfound page={NotFoundPage} />
      </Set>
    </Router>
  )
}

export default Routes
