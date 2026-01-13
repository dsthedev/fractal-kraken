import { Pencil, Trash2Icon, MapPin } from 'lucide-react'
import type { FindEstimates } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'

import { Badge } from 'src/components/ui/badge'
import { currencyDisplay, formatEnum, truncate } from 'src/lib/formatters.js'

export interface EstimateDrawerContentProps {
  estimate: FindEstimates[0]
  onDelete: (id: number) => void
}

export const EstimateDrawerContent = ({
  estimate,
  onDelete,
}: EstimateDrawerContentProps) => {
  const buildAddressString = (estimate: FindEstimates[0]): string => {
    const parts = []
    if (estimate.jobAddressLine1) parts.push(estimate.jobAddressLine1)
    if (estimate.jobAddressLine2) parts.push(estimate.jobAddressLine2)
    if (estimate.jobCity) parts.push(estimate.jobCity)
    if (estimate.jobState) parts.push(estimate.jobState)
    if (estimate.jobPostalCode) parts.push(estimate.jobPostalCode)
    if (estimate.jobCountry) parts.push(estimate.jobCountry)
    return parts.join(', ')
  }

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{truncate(estimate.title)}</h3>
        <Badge variant="outline">{formatEnum(estimate.status)}</Badge>
      </div>

      {estimate.clientEntity && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Client</p>
          <p className="text-sm font-medium">
            {truncate(estimate.clientEntity.name)}
          </p>
        </div>
      )}

      {buildAddressString(estimate) && (
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Job Address</p>
            <p className="text-sm">{buildAddressString(estimate)}</p>
          </div>
        </div>
      )}

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2">Total</p>
        <p className="text-3xl font-bold">{currencyDisplay(estimate.total)}</p>
      </div>

      <hr className="my-4" />
      <nav className="flex flex-col gap-2">
        <Link
          to={routes.editEstimate({ id: estimate.id })}
          title={'Edit estimate ' + estimate.id}
          className="rw-button rw-button-small rw-button-blue"
        >
          <Pencil className="h-4 w-4" />
          <span className="px-4">Edit Estimate</span>
        </Link>
        <button
          type="button"
          title={'Delete estimate ' + estimate.id}
          className="rw-button rw-button-small rw-button-red"
          onClick={() => onDelete(estimate.id)}
        >
          <Trash2Icon className="h-4 w-4" />
          <span className="px-4">Delete</span>
        </button>
      </nav>
    </div>
  )
}
