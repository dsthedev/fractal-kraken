import { Router, Route, Set, PrivateSet } from '@cedarjs/router'

import AdminScaffoldLayout from 'src/layouts/AdminScaffoldLayout'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import WrapperLayout from 'src/layouts/WrapperLayout'

import { useAuth } from './auth.js'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['guest', 'admin']}>
        <Set wrap={AdminScaffoldLayout} title="BillableItems" titleTo="billableItems" buttonLabel="New BillableItem" buttonTo="newBillableItem" showSearch={true}>
          <Route path="/billable-items" page={BillableItemBillableItemsPage} name="billableItems" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="BillableItems" titleTo="billableItems" buttonLabel="New BillableItem" buttonTo="newBillableItem">
          <Route path="/billable-items/{id:Int}/edit" page={BillableItemEditBillableItemPage} name="editBillableItem" />
          <Route path="/billable-items/{id:Int}" page={BillableItemBillableItemPage} name="billableItem" />
          <Route path="/billable-items/new" page={BillableItemNewBillableItemPage} name="newBillableItem" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Rates" titleTo="rates" buttonLabel="New Rate" buttonTo="newRate" showSearch={true}>
          <Route path="/rates" page={RateRatesPage} name="rates" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Rates" titleTo="rates" buttonLabel="New Rate" buttonTo="newRate">
          <Route path="/rates/new" page={RateNewRatePage} name="newRate" />
          <Route path="/rates/{id:Int}/edit" page={RateEditRatePage} name="editRate" />
          <Route path="/rates/{id:Int}" page={RateRatePage} name="rate" />
        </Set>
        <Set wrap={AdminScaffoldLayout as any} title="Services" titleTo="services" buttonLabel="New Service" buttonTo="newService" showSearch={true}>
          <Route path="/services" page={ServiceServicesPage} name="services" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Services" titleTo="services" buttonLabel="New Service" buttonTo="newService">
          <Route path="/services/new" page={ServiceNewServicePage} name="newService" />
          <Route path="/services/{id:Int}/edit" page={ServiceEditServicePage} name="editService" />
          <Route path="/services/{id:Int}" page={ServiceServicePage} name="service" />
        </Set>
      </PrivateSet>
      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['admin']}>
        <Set wrap={AdminScaffoldLayout as any} title="Measurement Units" titleTo="measurementUnits" buttonLabel="New Unit" buttonTo="newMeasurementUnit" showSearch={true}>
          <Route path="/measurement-units" page={MeasurementUnitMeasurementUnitsPage} name="measurementUnits" />
        </Set>
        <Set wrap={AdminScaffoldLayout as any} title="Measurement Units" titleTo="measurementUnits" buttonLabel="New Unit" buttonTo="newMeasurementUnit">
          <Route path="/measurement-units/new" page={MeasurementUnitNewMeasurementUnitPage} name="newMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}/edit" page={MeasurementUnitEditMeasurementUnitPage} name="editMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}" page={MeasurementUnitMeasurementUnitPage} name="measurementUnit" />
        </Set>

        <Set wrap={AdminScaffoldLayout as any} title="Users" titleTo="users" buttonLabel="New User" buttonTo="newUser">
          <Route path="/users/new" page={UserNewUserPage} name="newUser" />
          <Route path="/users/{id}/edit" page={UserEditUserPage} name="editUser" />
          <Route path="/users/{id}" page={UserUserPage} name="user" />
          <Route path="/users" page={UserUsersPage} name="users" />
        </Set>
      </PrivateSet>

      <Set wrap={WrapperLayout as any}>
        <Route path="/sandbox" page={SandboxPage} name="sandbox" />

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
