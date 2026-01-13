import { useEffect, useRef } from 'react'

import {
  Form,
  Label,
  TextField,
  PasswordField,
  Submit,
  FieldError,
} from '@cedarjs/forms'
import { Link, navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'

const LoginPage = () => {
  const { isAuthenticated, logIn } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard())
    }
  }, [isAuthenticated])

  const emailRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const onSubmit = async (data: Record<string, string>) => {
    const response = await logIn({
      username: data.email,
      password: data.password,
    })

    if (response.message) {
      toast(response.message)
    } else if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Welcome back!')
    }
  }

  return (
    <>
      <Metadata title="Login" />

      <main className="rw-main">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <div className="rw-scaffold rw-login-container">
          <div className="rw-segment max-w-xs mx-auto">
            <header className="my-6">
              <h2 className="text-3xl">Login</h2>
            </header>

            <div className="rw-form-wrapper">
              <Form onSubmit={onSubmit} className="rw-form-wrapper">
                <Label
                  name="email"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Email
                </Label>
                <TextField
                  name="email"
                  className="rw-input"
                  errorClassName="rw-input rw-input-error"
                  ref={emailRef}
                  validation={{
                    required: {
                      value: true,
                      message: 'Email is required',
                    },
                  }}
                />

                <FieldError name="email" className="rw-field-error" />

                <Label
                  name="password"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Password
                </Label>
                <PasswordField
                  name="password"
                  className="rw-input"
                  errorClassName="rw-input rw-input-error"
                  autoComplete="current-password"
                  validation={{
                    required: {
                      value: true,
                      message: 'Password is required',
                    },
                  }}
                />

                <FieldError name="password" className="rw-field-error" />

                <Submit className="rw-button rw-button-blue w-full my-4 max-w-48 mx-auto">
                  Login
                </Submit>

                <div className="my-4 text-center w-full">
                  <Link
                    to={routes.forgotPassword()}
                    className="underline text-xs"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </Form>
            </div>
          </div>
          <div className="rw-login-link">
            <span>Don&apos;t have an account?</span>{' '}
            <Link to={routes.signup()} className="rw-link">
              Sign up!
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default LoginPage
