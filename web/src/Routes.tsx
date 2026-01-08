import { Router, Route, Set } from '@cedarjs/router'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'

import WrapperLayout from 'src/layouts/WrapperLayout'

import { useAuth } from './auth.js'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Set wrap={ScaffoldLayout} title="Audits" titleTo="audits" buttonLabel="New Audit" buttonTo="newAudit">
        <Route path="/audits/new" page={AuditNewAuditPage} name="newAudit" />
        <Route path="/audits/{id}/edit" page={AuditEditAuditPage} name="editAudit" />
        <Route path="/audits/{id}" page={AuditAuditPage} name="audit" />
        <Route path="/audits" page={AuditAuditsPage} name="audits" />
      </Set>
      <Set wrap={ScaffoldLayout} title="Users" titleTo="users" buttonLabel="New User" buttonTo="newUser">
        <Route path="/users/new" page={UserNewUserPage} name="newUser" />
        <Route path="/users/{id}/edit" page={UserEditUserPage} name="editUser" />
        <Route path="/users/{id}" page={UserUserPage} name="user" />
        <Route path="/users" page={UserUsersPage} name="users" />
      </Set>
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
