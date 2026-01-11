import { useState } from 'react'

import type {
  DeleteRateMutation,
  DeleteRateMutationVariables,
  FindRates,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Rate/RatesCell'
import { truncate } from 'src/lib/formatters.js'

const DELETE_RATE_MUTATION: TypedDocumentNode<
  DeleteRateMutation,
  DeleteRateMutationVariables
> = gql`
  mutation DeleteRateMutation($id: Int!) {
    deleteRate(id: $id) {
      id
    }
  }
`

// Define a custom type for sortable fields including nested paths
type SortableField =
  | keyof FindRates['rates'][0]
  | 'service.action'
  | 'unit.fullName'

const RatesList = ({ rates }: FindRates) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })

  const [deleteRate] = useMutation(DELETE_RATE_MUTATION, {
    onCompleted: () => {
      toast.success('Rate deleted')
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

  const handleSort = (key: SortableField) => {
    if (sortConfig.key === key) {
      // Cycle through: asc -> desc -> remove (back to default)
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' })
      } else {
        // Reset to default
        setSortConfig({ key: 'id', direction: 'asc' })
      }
    } else {
      // New column clicked, start with asc
      setSortConfig({ key, direction: 'asc' })
    }
  }

  // Helper function to get nested property value
  const getNestedValue = (obj: FindRates['rates'][0], path: SortableField) => {
    if (path === 'service.action') {
      return obj.service?.action
    }
    if (path === 'unit.fullName') {
      return obj.unit?.fullName
    }
    return obj[path as keyof FindRates['rates'][0]]
  }

  const sortedRates = [...rates].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.key)
    const bValue = getNestedValue(b, sortConfig.key)

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Handle string comparison (case-insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue
        .toLowerCase()
        .localeCompare(bValue.toLowerCase())
      return sortConfig.direction === 'asc' ? comparison : -comparison
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const onDeleteClick = (id: DeleteRateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete rate ' + id + '?')) {
      deleteRate({ variables: { id } })
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortableField }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th
              onClick={() => handleSort('service.action')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Service
              <SortIcon columnKey="service.action" />
            </th>
            <th
              onClick={() => handleSort('unit.fullName')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Unit
              <SortIcon columnKey="unit.fullName" />
            </th>
            <th
              onClick={() => handleSort('subAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sub $
              <SortIcon columnKey="subAmount" />
            </th>
            <th
              onClick={() => handleSort('retailAmount')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Retail $
              <SortIcon columnKey="retailAmount" />
            </th>
            {/* <th>Currency</th> */}
            {/* <th>Author id</th> */}
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedRates.map((rate) => (
            <tr key={rate.id}>
              {/* <td>{truncate(rate.id)}</td> */}
              <td>
                {rate.service?.action +
                  ' ' +
                  rate.service?.material +
                  ' ' +
                  rate.service?.context}
              </td>
              <td>{rate.unit?.fullName || 'N/A'}</td>
              {/* <td>{truncate(rate.serviceId)}</td>
              <td>{truncate(rate.unitId)}</td> */}
              <td>{truncate(rate.subAmount)}</td>
              <td>{truncate(rate.retailAmount)}</td>
              {/* <td>{truncate(rate.currency)}</td> */}
              {/* <td>{truncate(rate.authorId)}</td> */}
              {/* <td>{truncate(rate.description)}</td> */}
              {/* <td>{timeTag(rate.createdAt)}</td> */}
              {/* <td>{timeTag(rate.updatedAt)}</td> */}
              <td className="print:hidden">
                <nav className="rw-table-actions">
                  <Link
                    to={routes.rate({ id: rate.id })}
                    title={'Show rate ' + rate.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editRate({ id: rate.id })}
                    title={'Edit rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete rate ' + rate.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(rate.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RatesList
