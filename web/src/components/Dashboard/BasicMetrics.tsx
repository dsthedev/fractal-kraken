import { Link } from '@cedarjs/router'

import { Button } from 'src/components/ui/button'
import { Card } from 'src/components/ui/card'

interface BasicMetricsProps {
  entitiesCount: number
  ratesCount: number
  estimatesCount: number
  invoicesCount: number
}

const BasicMetrics = ({
  entitiesCount,
  ratesCount,
  estimatesCount,
  invoicesCount,
}: BasicMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Entities Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Contacts
          </h3>
          <div className="text-4xl font-bold">{entitiesCount}</div>
          {entitiesCount === 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/entities/new">Create Entity</Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Rates Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Rates
          </h3>
          <div className="text-4xl font-bold">{ratesCount}</div>
          {ratesCount === 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/rates/new">Create Rate</Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Estimates Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Estimates
          </h3>
          <div className="text-4xl font-bold">{estimatesCount}</div>
          {estimatesCount === 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/estimates/new">Create Estimate</Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Invoices Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Invoices
          </h3>
          <div className="text-4xl font-bold">{invoicesCount}</div>
          {invoicesCount === 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/invoices/new">Create Invoice</Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default BasicMetrics
