import type { FindEntities, FindEntitiesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import { EntityDescription } from 'src/components/Dashboard/ResourceDescriptions'
import Entities from 'src/components/Entity/Entities'
import { ImportEntitiesButton } from 'src/components/ImportEntitiesButton/ImportEntitiesButton'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { useSearch } from 'src/contexts/SearchContext'

export const QUERY: TypedDocumentNode<FindEntities, FindEntitiesVariables> =
  gql`
    query FindEntities {
      entities {
        id
        type
        name
        nickname
        contactName
        email
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        notes
        isBusiness
        usesNickname
        createdAt
        updatedAt
      }
    }
  `

export const Loading = () => (
  <>
    <div className="flex w-full flex-col gap-2 my-10">
      <h2 className="text-xl mx-auto my-4">Loading Contacts...</h2>
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </>
)

export const Empty = () => {
  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl">No Contacts... Yet!</h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Contact entities represent any person or business involved in your
              flooring work. Each entity can have a specific role.
            </p>

            <div className="rounded-md border p-3 text-left text-sm">
              <ul className="space-y-1">
                <li>
                  <strong>Contractor:</strong> Your business (installer)
                </li>
                <li>
                  <strong>Client:</strong> The customer hiring you
                </li>
                <li>
                  <strong>Retailer:</strong> Where materials are sourced
                </li>
                <li>
                  <strong>Other:</strong> Any additional contacts
                </li>
              </ul>
            </div>

            <p>
              Track contact information, addresses, and associate them with your
              estimates and invoices.
            </p>
          </div>

          <Button asChild variant="lime" size="lg" className="w-full">
            <Link to={routes.newEntity()}>Create Contact Entity</Link>
          </Button>

          <hr className="my-6" />
          <ImportEntitiesButton
            label="Import Contact Entities"
            refetchQuery={QUERY}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindEntities>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  entities,
}: CellSuccessProps<FindEntities, FindEntitiesVariables>) => {
  const { searchQuery } = useSearch()

  // Filter entities based on search query
  const filteredEntities =
    entities?.filter((entity) => {
      const query = searchQuery.toLowerCase()
      return (
        entity.name?.toLowerCase().includes(query) ||
        entity.contactName?.toLowerCase().includes(query) ||
        entity.email?.toLowerCase().includes(query) ||
        entity.phone?.toLowerCase().includes(query) ||
        entity.city?.toLowerCase().includes(query) ||
        entity.state?.toLowerCase().includes(query)
      )
    }) || []

  return (
    <>
      <Entities entities={filteredEntities} />
      <hr className="my-10" />
      <EntityDescription />
    </>
  )
}
