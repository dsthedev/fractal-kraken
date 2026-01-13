import { useState } from 'react'

import { Pencil, Trash2Icon, MapPin } from 'lucide-react'
import type {
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables,
  FindEstimates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Estimate/EstimatesCell'
import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'src/components/ui/drawer'
import {
  currencyDisplay,
  formatEnum,
  timeTagMDY,
  truncate,
} from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_ESTIMATE_MUTATION: TypedDocumentNode<
  DeleteEstimateMutation,
  DeleteEstimateMutationVariables
> = gql`
  mutation DeleteEstimateMutation($id: Int!) {
    deleteEstimate(id: $id) {
      id
    }
  }
`

const EstimatesList = ({ estimates }: FindEstimates) => {
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null)

  const [deleteEstimate] = useMutation(DELETE_ESTIMATE_MUTATION, {
    onCompleted: () => {
      toast.success('Estimate deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteEstimateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete estimate ' + id + '?')) {
      deleteEstimate({ variables: { id } })
    }
  }

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

  // Reusable details content component for drawer
  const EstimateDetailsContent = ({
    estimate,
  }: {
    estimate: FindEstimates[0]
  }) => (
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
          onClick={() => onDeleteClick(estimate.id)}
        >
          <Trash2Icon className="h-4 w-4" />
          <span className="px-4">Delete</span>
        </button>
      </nav>
    </div>
  )

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th className="hidden sm:table-cell">Title</th>
            <th className="hidden sm:table-cell">Total</th>
            <th className="hidden sm:table-cell">Created at</th>
            <th className="hidden sm:table-cell">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => (
            <tr key={estimate.id}>
              <td>
                <button
                  type="button"
                  title={'Details for estimate ' + estimate.id}
                  className="text-sm font-medium text-blue-600 hover:underline sm:hidden text-left"
                  onClick={() => setOpenDrawerId(estimate.id)}
                >
                  {truncate(estimate.title)}
                </button>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden sm:inline-flex"
                >
                  <Link
                    to={routes.estimate({ id: estimate.id })}
                    title={'Show estimate ' + estimate.id + ' detail'}
                  >
                    {truncate(estimate.title)}
                  </Link>
                </Button>
              </td>
              <td className="hidden sm:table-cell">
                {currencyDisplay(estimate.total)}
              </td>
              <td className="hidden sm:table-cell">
                {timeTagMDY(estimate.createdAt)}
              </td>
              <td className="hidden sm:table-cell">
                <nav className="rw-table-actions flex flex-wrap gap-1 sm:flex-nowrap">
                  <Link
                    to={routes.editEstimate({ id: estimate.id })}
                    title={'Edit estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-blue flex-1"
                  >
                    <Pencil />
                  </Link>
                  <button
                    type="button"
                    title={'Delete estimate ' + estimate.id}
                    className="rw-button rw-button-small rw-button-red flex-1"
                    onClick={() => onDeleteClick(estimate.id)}
                  >
                    <Trash2Icon />
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Drawer for mobile details view */}
      {estimates.map((estimate) => (
        <Drawer
          key={`drawer-${estimate.id}`}
          open={openDrawerId === estimate.id}
          onOpenChange={(open) => setOpenDrawerId(open ? estimate.id : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Estimate Details</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <EstimateDetailsContent estimate={estimate} />
            </div>
          </DrawerContent>
        </Drawer>
      ))}

      <hr className="mb-6" />
      <ExportButton
        label="Export All Estimates"
        data={estimates}
        filename={`${todayAsYYYYMMDD()}-estimates.csv`}
      />
    </div>
  )
}

export default EstimatesList
