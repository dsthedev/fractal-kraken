import type { FindEstimates, FindEstimatesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Estimates from 'src/components/Estimate/Estimates'
import { ImportEstimatesButton } from 'src/components/ImportEstimatesButton/ImportEstimatesButton'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindEstimates, FindEstimatesVariables> =
  gql`
    query FindEstimates {
      estimates {
        id
        uuid
        title
        status
        installerEntityId
        clientEntityId
        retailerEntityId
        jobAddressLine1
        jobAddressLine2
        jobCity
        jobState
        jobPostalCode
        jobCountry
        subtotal
        taxTotal
        total
        estimatedMinutesTotal
        authorId
        notes
        createdAt
        updatedAt
        entityId
        installerEntity {
          id
          type
          name
          contactName
          addressLine1
          addressLine2
          city
          state
          postalCode
        }
        clientEntity {
          id
          type
          name
          contactName
          addressLine1
          addressLine2
          city
          state
          postalCode
        }
        retailerEntity {
          id
          type
          name
          contactName
          addressLine1
          addressLine2
          city
          state
          postalCode
        }
        billableItems {
          id
          actionId
          materialId
          unitId
          quantity
          unitPrice
          subtotal
          action {
            id
            name
          }
          material {
            id
            name
          }
          unit {
            id
            fullName
          }
        }
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl">No Estimates... Yet!</h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              An estimate is a detailed quote for a flooring project. It shows
              the client what the work will cost before they commit.
            </p>

            <div className="rounded-md border p-3 text-left text-sm">
              <ul className="space-y-1">
                <li>
                  <strong>Line Items:</strong> Actions, materials, quantities,
                  and prices
                </li>
                <li>
                  <strong>Statuses:</strong> Track from draft to invoiced
                </li>
                <li>
                  <strong>Roles:</strong> Assign installer, client, and retailer
                </li>
                <li>
                  <strong>Job Details:</strong> Location, notes, and timeline
                </li>
              </ul>
            </div>

            <p>
              Build professional estimates with your rates, then convert them to
              invoices when the work is approved.
            </p>
          </div>

          <Button asChild variant="lime" size="lg" className="w-full">
            <Link to={routes.newEstimate()}>Create an Estimate</Link>
          </Button>

          <hr className="my-6" />
          <div className="flex flex-col items-center gap-2">
            <ImportEstimatesButton
              label="Import Estimates"
              disabled
              refetchQuery={QUERY}
            />
            <small className="text-muted-foreground">
              Estimate import feature is coming soon!
            </small>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindEstimates>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  estimates,
}: CellSuccessProps<FindEstimates, FindEstimatesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = estimates.filter((estimate) => {
    const searchable = [
      estimate.title || '',
      estimate.status || '',
      estimate.installerEntity?.name || '',
      estimate.installerEntity?.contactName || '',
      estimate.clientEntity?.name || '',
      estimate.clientEntity?.contactName || '',
      estimate.retailerEntity?.name || '',
      estimate.retailerEntity?.contactName || '',
      estimate.jobAddressLine1 || '',
      estimate.jobAddressLine2 || '',
      estimate.jobCity || '',
      estimate.jobState || '',
      estimate.notes || '',
    ]
      .join(' ')
      .toLowerCase()
    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Estimates estimates={filtered} />
}
