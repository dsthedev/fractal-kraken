import { Link, routes } from '@cedarjs/router'

export const EntityDescription = () => (
  <div className="rounded-lg border bg-card p-6 my-6 mx-auto max-w-md">
    <h3 className="mb-3 text-xl font-semibold">
      <Link to={routes.entities()}>Contacts</Link>
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Contacts are the people and organizations you work with. This includes
      your clients (who you bid jobs to), retailers (material suppliers), and
      installers (who complete the labor necessary for jobs). You can also
      define your own contractor information here.
    </p>
  </div>
)

export const RateDescription = () => (
  <div className="rounded-lg border bg-card p-6 my-6 mx-auto max-w-md">
    <h3 className="mb-3 text-xl font-semibold">
      <Link to={routes.rates()}>Rates</Link>
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Rates define the pricing for common actions and materials to be used
      quickly on estimates and invoices. Each rate includes a measurement unit,
      subcontractor rate, regular rate (retail), and an optional estimated time
      per unit (Experimental). Rates enable quick, consistent pricing across
      estimates.
    </p>
  </div>
)

export const EstimateDescription = () => (
  <div className="rounded-lg border bg-card p-6 my-6 mx-auto max-w-md">
    <h3 className="mb-3 text-xl font-semibold">
      <Link to={routes.estimates()}>Estimates</Link>
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Estimates are editable job proposals that combine entities, billable
      items, and rates to calculate total cost and time. Track status from draft
      through invoiced. Once accepted, estimates become the basis for invoicing
      and payment tracking.
    </p>
  </div>
)
