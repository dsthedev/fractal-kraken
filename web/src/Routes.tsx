import { Router, Route, Set, PrivateSet } from '@cedarjs/router'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import WrapperLayout from 'src/layouts/WrapperLayout'

import { useAuth } from './auth.js'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <PrivateSet wrap={WrapperLayout} unauthenticated="login" roles={['admin']}>
        <Set wrap={ScaffoldLayout} title="MeasurementUnits" titleTo="measurementUnits" buttonLabel="New MeasurementUnit" buttonTo="newMeasurementUnit">
          <Route path="/measurement-units/new" page={MeasurementUnitNewMeasurementUnitPage} name="newMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}/edit" page={MeasurementUnitEditMeasurementUnitPage} name="editMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}" page={MeasurementUnitMeasurementUnitPage} name="measurementUnit" />
          <Route path="/measurement-units" page={MeasurementUnitMeasurementUnitsPage} name="measurementUnits" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Users" titleTo="users" buttonLabel="New User" buttonTo="newUser">
          <Route path="/users/new" page={UserNewUserPage} name="newUser" />
          <Route path="/users/{id}/edit" page={UserEditUserPage} name="editUser" />
          <Route path="/users/{id}" page={UserUserPage} name="user" />
          <Route path="/users" page={UserUsersPage} name="users" />
        </Set>
      </PrivateSet>
      <Set wrap={WrapperLayout}>
        <Route path="/login" page={LoginPage} name="login" />
        <Route path="/signup" page={SignupPage} name="signup" />
        <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
        <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
        <Route path="/" page={HomePage} name="home" />

        <Route notfound page={NotFoundPage} />
      </Set>
    </Router>
  )
}

export default Routes
