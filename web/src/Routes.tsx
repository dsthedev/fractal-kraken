import { Router, Route, Set, PrivateSet } from '@cedarjs/router'

import AdminScaffoldLayout from 'src/layouts/AdminScaffoldLayout'
// import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import WrapperLayout from 'src/layouts/WrapperLayout'

import { useAuth } from './auth.js'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['guest', 'admin']}>
        <Set wrap={AdminScaffoldLayout} title="Materials" titleTo="materials" buttonLabel="New" buttonTo="newMaterial">
          <Route path="/materials/new" page={MaterialNewMaterialPage} name="newMaterial" />
          <Route path="/materials/{id:Int}/edit" page={MaterialEditMaterialPage} name="editMaterial" />
          <Route path="/materials/{id:Int}" page={MaterialMaterialPage} name="material" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Materials" titleTo="materials" buttonLabel="New" buttonTo="newMaterial" showSearch={true}>
          <Route path="/materials" page={MaterialMaterialsPage} name="materials" />
        </Set>
      </PrivateSet>
      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['guest', 'admin']}>
        <Set wrap={AdminScaffoldLayout} title="Actions" titleTo="actions" buttonLabel="New" buttonTo="newAction">
          <Route path="/actions/new" page={ActionNewActionPage} name="newAction" />
          <Route path="/actions/{id:Int}/edit" page={ActionEditActionPage} name="editAction" />
          <Route path="/actions/{id:Int}" page={ActionActionPage} name="action" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Actions" titleTo="actions" buttonLabel="New" buttonTo="newAction" showSearch={true}>
          <Route path="/actions" page={ActionActionsPage} name="actions" />
        </Set>
      </PrivateSet>
      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['guest', 'admin']}>
        <Set wrap={AdminScaffoldLayout} title="Estimates" titleTo="estimates" buttonLabel="New" buttonTo="newEstimate">
          <Route path="/estimates/new" page={EstimateNewEstimatePage} name="newEstimate" />
          <Route path="/estimates/{id:Int}/edit" page={EstimateEditEstimatePage} name="editEstimate" />
          <Route path="/estimates/{id:Int}" page={EstimateEstimatePage} name="estimate" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Estimates" titleTo="estimates" buttonLabel="New" buttonTo="newEstimate" showSearch={true}>
          <Route path="/estimates" page={EstimateEstimatesPage} name="estimates" />
        </Set>
        <Route path="/dashboard" page={DashboardPage} name="dashboard" />
        <Set wrap={AdminScaffoldLayout} title="Contacts" titleTo="entities" buttonLabel="New" buttonTo="newEntity">
          <Route path="/entities/new" page={EntityNewEntityPage} name="newEntity" />
          <Route path="/entities/{id:Int}/edit" page={EntityEditEntityPage} name="editEntity" />
          <Route path="/entities/{id:Int}" page={EntityEntityPage} name="entity" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Contacts" titleTo="entities" buttonLabel="New" buttonTo="newEntity" showSearch={true}>
          <Route path="/entities" page={EntityEntitiesPage} name="entities" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="BillableItems" titleTo="billableItems" buttonLabel="New" buttonTo="newBillableItem">
          <Route path="/billable-items/{id:Int}/edit" page={BillableItemEditBillableItemPage} name="editBillableItem" />
          <Route path="/billable-items/{id:Int}" page={BillableItemBillableItemPage} name="billableItem" />
          <Route path="/billable-items/new" page={BillableItemNewBillableItemPage} name="newBillableItem" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="BillableItems" titleTo="billableItems" buttonLabel="New" buttonTo="newBillableItem" showSearch={true}>
          <Route path="/billable-items" page={BillableItemBillableItemsPage} name="billableItems" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Rates" titleTo="rates" buttonLabel="New" buttonTo="newRate">
          <Route path="/rates/new" page={RateNewRatePage} name="newRate" />
          <Route path="/rates/{id:Int}/edit" page={RateEditRatePage} name="editRate" />
          <Route path="/rates/{id:Int}" page={RateRatePage} name="rate" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Rates" titleTo="rates" buttonLabel="New" buttonTo="newRate" showSearch={true}>
          <Route path="/rates" page={RateRatesPage} name="rates" />
        </Set>
        <Set wrap={AdminScaffoldLayout} title="Services" titleTo="services" buttonLabel="New" buttonTo="newService">
          <Route path="/services/new" page={ServiceNewServicePage} name="newService" />
          <Route path="/services/{id:Int}/edit" page={ServiceEditServicePage} name="editService" />
          <Route path="/services/{id:Int}" page={ServiceServicePage} name="service" />
        </Set>
        <Set wrap={AdminScaffoldLayout as any} title="Services" titleTo="services" buttonLabel="New" buttonTo="newService" showSearch={true}>
          <Route path="/services" page={ServiceServicesPage} name="services" />
        </Set>
      </PrivateSet>

      <PrivateSet wrap={WrapperLayout as any} unauthenticated="login" roles={['guest', 'admin']}>
        <Set wrap={AdminScaffoldLayout as any} title="Measurement Units" titleTo="measurementUnits" buttonLabel="New" buttonTo="newMeasurementUnit">
          <Route path="/measurement-units/new" page={MeasurementUnitNewMeasurementUnitPage} name="newMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}/edit" page={MeasurementUnitEditMeasurementUnitPage} name="editMeasurementUnit" />
          <Route path="/measurement-units/{id:Int}" page={MeasurementUnitMeasurementUnitPage} name="measurementUnit" />
        </Set>
        <Set wrap={AdminScaffoldLayout as any} title="Measurement Units" titleTo="measurementUnits" buttonLabel="New" buttonTo="newMeasurementUnit" showSearch={true}>
          <Route path="/measurement-units" page={MeasurementUnitMeasurementUnitsPage} name="measurementUnits" />
        </Set>

        <Set wrap={AdminScaffoldLayout as any} title="Users" titleTo="users" buttonLabel="New" buttonTo="newUser">
          <Route path="/users/new" page={UserNewUserPage} name="newUser" />
          <Route path="/users/{id}/edit" page={UserEditUserPage} name="editUser" />
          <Route path="/users/{id}" page={UserUserPage} name="user" />
        </Set>
        <Set wrap={AdminScaffoldLayout as any} title="Users" titleTo="users" buttonLabel="New" buttonTo="newUser" showSearch={true}>
          <Route path="/users" page={UserUsersPage} name="users" />
        </Set>
      </PrivateSet>

      <Set wrap={WrapperLayout as any}>
        <Route path="/getting-started" page={GettingStartedPage} name="gettingStarted" />
        <Route path="/view-old-rates" page={ViewOldRatesPage} name="viewOldRates" />
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
