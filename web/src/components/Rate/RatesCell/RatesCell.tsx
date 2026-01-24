import type { FindRates, FindRatesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import { ImportButton } from 'src/components/ImportButton/ImportButton'
import Rates from 'src/components/Rate/Rates'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { useSearch } from 'src/contexts/SearchContext'
import { currencyDisplay } from 'src/lib/formatters'

export const QUERY: TypedDocumentNode<FindRates, FindRatesVariables> = gql`
  query FindRates {
    rates {
      id
      actionId
      materialId
      context
      unitId
      subAmount
      retailAmount
      currency
      authorId
      estimatedMinutesPerUnit
      description
      createdAt
      updatedAt
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
        fullName
        shortName
      }
    }
  }
`

const exampleRate = {
  action: 'Install',
  material: 'Vinyl',
  context: 'Plank',
  unitLabel: 'Per Square Foot',
  unitShort: 'sqft',
  subAmount: 1.5,
  retailAmount: 2.0,
}

const buildSentence = ({
  action,
  material,
  context,
  unitShort,
  subAmount,
  retailAmount,
}: typeof exampleRate) =>
  `The cost to ${action.toLowerCase()} ${material.toLowerCase()} ${context.toLowerCase()} flooring is ${currencyDisplay(
    subAmount
  )} / ${unitShort} as a subcontractor or ${currencyDisplay(
    retailAmount
  )} / ${unitShort} as an independent contractor.`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  const sentence = buildSentence(exampleRate)

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-4xl">No Rates... Yet!</h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              A rate defines how much a specific type of work costs. Each rate
              is composed of:
            </p>

            <div className="rounded-md border p-3 text-left text-sm">
              <ul className="space-y-1">
                <li>
                  <strong>Action:</strong> {exampleRate.action}
                </li>
                <li>
                  <strong>Material:</strong> {exampleRate.material}
                </li>
                <li>
                  <strong>Context:</strong> {exampleRate.context}
                </li>
                <li>
                  <strong>Unit:</strong> {exampleRate.unitLabel}
                </li>
                <li>
                  <strong>Sub / Retail:</strong>{' '}
                  {currencyDisplay(exampleRate.subAmount)} /{' '}
                  {currencyDisplay(exampleRate.retailAmount)}
                </li>
              </ul>
            </div>

            <p>
              <strong className="block mb-3">In other words:</strong>
              {sentence
                .split(/(\$[0-9.,]+)/)
                .map((part, i) =>
                  part.startsWith('$') ? (
                    <strong key={i}>{part}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </p>
          </div>

          <Button asChild variant="lime" size="lg" className="w-full">
            <Link to={routes.newRate()}>Create a Rate</Link>
          </Button>

          <hr className="my-6" />
          <ImportButton label="Import Rates" refetchQuery={QUERY} />
        </CardContent>
      </Card>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindRates>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  rates,
}: CellSuccessProps<FindRates, FindRatesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = rates.filter((r) => {
    const searchable = [
      r.action?.name,
      r.material?.name,
      r.action?.description,
      r.material?.description,
      r.context,
      r.unit?.fullName,
      r.estimatedMinutesPerUnit,
      r.description,
      r.subAmount,
      r.retailAmount,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })

  return <Rates rates={filtered} />
}
