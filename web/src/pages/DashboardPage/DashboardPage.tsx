import { useState } from 'react'

import type { FindEntities, FindRates, FindEstimates } from 'types/graphql'

import type { TypedDocumentNode } from '@cedarjs/web'
import { useQuery, Metadata } from '@cedarjs/web'

import BasicMetrics from 'src/components/Dashboard/BasicMetrics'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'src/components/ui/tabs'
import ConnectedEntities from 'src/components/User/ConnectedEntities'
import EditUserProfile from 'src/components/User/EditUserProfile'
import UserProfile from 'src/components/User/UserProfile'

const ENTITIES_QUERY: TypedDocumentNode<FindEntities> = gql`
  query FindEntities {
    entities {
      id
    }
  }
`

const RATES_QUERY: TypedDocumentNode<FindRates> = gql`
  query FindRates {
    rates {
      id
    }
  }
`

const ESTIMATES_QUERY: TypedDocumentNode<FindEstimates> = gql`
  query FindEstimates {
    estimates {
      id
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

  const entitiesCount =
    !entitiesLoading && entitiesData ? entitiesData.entities.length : 0
  const ratesCount = !ratesLoading && ratesData ? ratesData.rates.length : 0
  const estimatesCount =
    !estimatesLoading && estimatesData ? estimatesData.estimates.length : 0

  return (
    <>
      <Metadata title="Dashboard" description="Dashboard page" />

      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <BasicMetrics
              entitiesCount={entitiesCount}
              ratesCount={ratesCount}
              estimatesCount={estimatesCount}
            />
            <div className="flex my-8 border-b-2 py-4 text-2xl">
              <h2>What are these metrics?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Entities</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Entities are the people and organizations you work with. This
                  includes your clients (who you bid jobs to), retailers
                  (material suppliers), and installers (who help with jobs). You
                  can also define your own contractor information here.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Rates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rates define the pricing for actions and materials. Each rate
                  includes a measurement unit, sub amount (cost), retail amount
                  (pricing), and optional estimated time per unit. Rates enable
                  quick, consistent pricing across estimates.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Estimates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Estimates are editable job proposals that combine entities,
                  billable items, and rates to calculate total cost and time.
                  Track status from draft through invoiced. Once accepted,
                  estimates become the basis for invoicing and payment tracking.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="entities" className="mt-6">
            <ConnectedEntities />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
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
