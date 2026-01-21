import type { FindEstimateById, FindEstimateByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Estimate from 'src/components/Estimate/Estimate'

export const QUERY: TypedDocumentNode<
  FindEstimateById,
  FindEstimateByIdVariables
> = gql`
  query FindEstimateById($id: Int!) {
    estimate: estimate(id: $id) {
      id
      uuid
      title
      status
      installerEntityId
      installerEntity {
        id
        name
        nickname
        contactName
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
      }
      clientEntityId
      clientEntity {
        id
        name
        nickname
        contactName
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
      }
      retailerEntityId
      retailerEntity {
        id
        name
        nickname
        contactName
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
      }
      billableItems {
        id
        quantity
        unit {
          id
          symbol
          fullName
          shortName
        }
        action {
          id
          name
          description
        }
        material {
          id
          name
          description
        }
        pricingType
        notes
        unitPrice
        subtotal
        sortOrder
      }
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
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Estimate not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindEstimateByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  estimate,
}: CellSuccessProps<FindEstimateById, FindEstimateByIdVariables>) => {
  return <Estimate estimate={estimate} />
}
