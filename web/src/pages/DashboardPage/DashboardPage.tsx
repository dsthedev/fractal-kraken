import { useState } from 'react'

import { Pencil } from 'lucide-react'
import type {
  FindEntitiesForDashboard,
  FindRatesForDashboard,
  FindEstimatesForDashboard,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type { TypedDocumentNode } from '@cedarjs/web'
import { useQuery, Metadata } from '@cedarjs/web'

import BasicMetrics from 'src/components/Dashboard/BasicMetrics'
import {
  EntityDescription,
  EstimateDescription,
  RateDescription,
} from 'src/components/Dashboard/ResourceDescriptions'
import { Button } from 'src/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'src/components/ui/tabs'
import ConnectedEntities from 'src/components/User/ConnectedEntities'
import EditUserProfile from 'src/components/User/EditUserProfile'
import UserProfile from 'src/components/User/UserProfile'

const ENTITIES_QUERY: TypedDocumentNode<FindEntitiesForDashboard> = gql`
  query FindEntitiesForDashboard {
    entities {
      id
    }
  }
`

const RATES_QUERY: TypedDocumentNode<FindRatesForDashboard> = gql`
  query FindRatesForDashboard {
    rates {
      id
    }
  }
`

const ESTIMATES_QUERY: TypedDocumentNode<FindEstimatesForDashboard> = gql`
  query FindEstimatesForDashboard {
    estimates {
      id
    }
  }
`

const INVOICES_QUERY = gql`
  query FindInvoicesForDashboard {
    invoices {
      uuid
    }
  }
`

const DashboardPage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { data: entitiesData, loading: entitiesLoading } =
    useQuery(ENTITIES_QUERY)
  const { data: ratesData, loading: ratesLoading } = useQuery(RATES_QUERY)
  const { data: estimatesData, loading: estimatesLoading } =
    useQuery(ESTIMATES_QUERY)
  const { data: invoicesData, loading: invoicesLoading } =
    useQuery(INVOICES_QUERY)

  const entitiesCount =
    !entitiesLoading && entitiesData ? entitiesData.entities.length : 0
  const ratesCount = !ratesLoading && ratesData ? ratesData.rates.length : 0
  const estimatesCount =
    !estimatesLoading && estimatesData ? estimatesData.estimates.length : 0
  const invoicesCount =
    !invoicesLoading && invoicesData ? invoicesData.invoices.length : 0

  return (
    <>
      <Metadata title="Dashboard" description="Dashboard page" />

      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
        <hr className="my-4" />
        <div className="block">
          New to {process.env.PROJECT_NAME}? Read the{' '}
          <Button asChild variant="outline">
            <Link to={routes.gettingStarted()}>Getting Started</Link>
          </Button>{' '}
          guide.
          <hr className="my-4" />
        </div>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="entities">Contacts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <BasicMetrics
              entitiesCount={entitiesCount}
              ratesCount={ratesCount}
              estimatesCount={estimatesCount}
              invoicesCount={invoicesCount}
            />
            <div className="flex my-8 border-b-2 py-4 text-2xl">
              <h2>What are these metrics?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EntityDescription />
              <RateDescription />
              <EstimateDescription />
            </div>
          </TabsContent>

          <TabsContent value="entities" className="mt-6">
            <ConnectedEntities />
          </TabsContent>

          <TabsContent value="profile" className="mt-6 relative">
            {!isEditing && (
              <div className="absolute top-4 right-4 mb-4 flex justify-end">
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil />
                </Button>
              </div>
            )}
            {isEditing ? (
              <EditUserProfile onDone={() => setIsEditing(false)} />
            ) : (
              <UserProfile />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default DashboardPage
