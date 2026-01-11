import { useState } from 'react'

import type {
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  FindServices,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { QUERY } from 'src/components/Service/ServicesCell'
import { formatEnum, truncate } from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_SERVICE_MUTATION: TypedDocumentNode<
  DeleteServiceMutation,
  DeleteServiceMutationVariables
> = gql`
  mutation DeleteServiceMutation($id: Int!) {
    deleteService(id: $id) {
      id
    }
  }
`

const ServicesList = ({ services }: FindServices) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FindServices['services'][0]
    direction: 'asc' | 'desc'
  }>({ key: 'id', direction: 'asc' })

  const [deleteService] = useMutation(DELETE_SERVICE_MUTATION, {
    onCompleted: () => {
      toast.success('Service deleted')
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

  const handleSort = (key: keyof FindServices['services'][0]) => {
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

  const sortedServices = [...services].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const onDeleteClick = (id: DeleteServiceMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete service ' + id + '?')) {
      deleteService({ variables: { id } })
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
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
              onClick={() => handleSort('action')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Action
              <SortIcon columnKey="action" />
            </th>
            <th
              onClick={() => handleSort('material')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Material
              <SortIcon columnKey="material" />
            </th>
            <th
              onClick={() => handleSort('context')}
              className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Context
              <SortIcon columnKey="context" />
            </th>
            {/* <th>Description</th> */}
            {/* <th>Created at</th> */}
            {/* <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedServices.map((service) => (
            <tr key={service.id}>
              {/* <td>{truncate(service.id)}</td> */}
              <td>{formatEnum(service.action)}</td>
              <td>{truncate(service.material)}</td>
              <td>{truncate(service.context)}</td>
              {/* <td>{truncate(service.description)}</td> */}
              {/* <td>{timeTag(service.createdAt)}</td> */}
              {/* <td>{timeTag(service.updatedAt)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.service({ id: service.id })}
                    title={'Show service ' + service.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editService({ id: service.id })}
                    title={'Edit service ' + service.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete service ' + service.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(service.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="mb-6" />
      <ExportButton
        label="Export All Services"
        data={services}
        filename={`${todayAsYYYYMMDD()}-services.csv`}
      />
    </div>
  )
}

export default ServicesList
