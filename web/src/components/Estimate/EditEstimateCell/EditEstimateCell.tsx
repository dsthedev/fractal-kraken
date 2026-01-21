import type {
  EditEstimateById,
  UpdateEstimateInput,
  UpdateEstimateMutationVariables,
  FindEntities,
  Entity,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation, useQuery } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import EstimateForm from 'src/components/Estimate/EstimateForm'

const FIND_ENTITIES_QUERY: TypedDocumentNode<FindEntities> = gql`
  query FindEntitiesForEditEstimate {
    entities {
      id
      type
      name
      addressLine1
      addressLine2
      city
      state
      postalCode
      contactName
      email
      phone
      createdAt
      updatedAt
      usersDefault {
        id
      }
      usersRetailer {
        id
      }
    }
  }
`

export const QUERY: TypedDocumentNode<EditEstimateById> = gql`
  query EditEstimateById($id: Int!) {
    estimate: estimate(id: $id) {
      id
      uuid
      title
      status
      installerEntityId
      installerEntity {
        id
        type
        name
        nickname
        addressLine1
        addressLine2
        city
        state
        postalCode
      }
      clientEntityId
      clientEntity {
        id
        type
        name
        nickname
        addressLine1
        addressLine2
        city
        state
        postalCode
      }
      retailerEntityId
      retailerEntity {
        id
        type
        name
        nickname
        addressLine1
        addressLine2
        city
        state
        postalCode
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
      billableItems {
        id
        unitId
        unitPrice
        pricingType
        quantity
        subtotal
        estimatedMinutesPerUnit
        notes
        sortOrder
        estimateId
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
        unit {
          id
          shortName
          fullName
        }
      }
    }
  }
`

const UPDATE_ESTIMATE_MUTATION: TypedDocumentNode<
  EditEstimateById,
  UpdateEstimateMutationVariables
> = gql`
  mutation UpdateEstimateMutation($id: Int!, $input: UpdateEstimateInput!) {
    updateEstimate(id: $id, input: $input) {
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
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ estimate }: CellSuccessProps<EditEstimateById>) => {
  const { data: entitiesData } = useQuery(FIND_ENTITIES_QUERY)
  const [updateEstimate, { loading, error }] = useMutation(
    UPDATE_ESTIMATE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Estimate updated')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateEstimateInput,
    id: EditEstimateById['estimate']['id']
  ) => {
    updateEstimate({ variables: { id, input } })
  }

  const onSaveAndExit = async (input, id) => {
    await updateEstimate({ variables: { id, input } })
    toast.success('Estimate updated')
    navigate(routes.estimates())
  }

  return (
    <div className="rw-segment">
      <header className="mb-4 border-b pb-4 print:hidden">
        <h2 className="text-2xl font-semibold">Estimate</h2>
      </header>
      <div className="rw-segment-main">
        <EstimateForm
          estimate={estimate}
          onSave={onSave}
          onSaveAndExit={onSaveAndExit}
          error={error}
          loading={loading}
          entities={entitiesData?.entities as Entity[]}
        />
      </div>
    </div>
  )
}
