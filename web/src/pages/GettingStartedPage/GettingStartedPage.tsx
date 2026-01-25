// import { Link, routes } from '@cedarjs/router'
import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'

const GettingStartedPage = () => {
  return (
    <>
      <Metadata
        title="Getting Started"
        description="Learn how to use entities, rates, and estimates to get up and running quickly."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
        {/* Page intro */}
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Getting Started
          </h1>
          <p className="text-muted-foreground text-base">
            This app is designed to help you create accurate, consistent
            estimates quickly. There are three core building blocks. Set them up
            once, then reuse them everywhere.
          </p>
        </header>

        {/* Entities */}
        <Card>
          <CardHeader>
            <CardTitle>1. Entities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Entities represent the people and businesses you work with —
              clients, contractors, and companies. This is where you keep track
              of contact details like names, emails, phone numbers, and
              addresses.
            </p>

            <p className="text-muted-foreground">
              Information stored on entities is reused throughout the app. For
              example, addresses can autofill on estimates and emails are ready
              to use when sending them.
            </p>

            <Button asChild>
              <Link to={routes.newEntity()}>Create your first entity</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Rates */}
        <Card>
          <CardHeader>
            <CardTitle>2. Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Rates are the standardization core of the app. They define what
              you typically charge for common tasks — labor, materials, or
              services — in a consistent, repeatable way.
            </p>

            <p className="text-muted-foreground">
              Rates act as templates. When you add them to an estimate, you can
              freely adjust quantities or prices without affecting the original
              rate or any other estimates.
            </p>

            <Button asChild>
              <Link to={routes.newRate()}>Create your first rate</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>3. Estimates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Estimates are the primary output of the app. With entities and
              rates in place, you can assemble a complete, accurate estimate in
              minutes — even while on site.
            </p>

            <p className="text-muted-foreground">
              No more handwritten notes or binders. Build the estimate, review
              the totals, and send it immediately once you’re done.
            </p>

            <Button asChild>
              <Link to={routes.newEstimate()}>Create a new estimate</Link>
            </Button>
          </CardContent>
        </Card>
        <hr className="my-6" />
        <div className="flex flex-col space-y-4">
          <h3 className="text-2xl font-semibold">Looking for More?</h3>
          <p>
            Stay tuned, there are more features coming soon! The following is on
            the roadmap next:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>GPS location saving for on-site estimates</li>
            <li>Invoices: create an invoice automatically from an estimate!</li>
            <li>Financial metrics based on estimates and invoices!</li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default GettingStartedPage
