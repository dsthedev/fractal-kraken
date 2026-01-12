import { useState } from 'react'

import { Pencil, Trash2, Filter } from 'lucide-react'
import type {
  DeleteEntityMutation,
  DeleteEntityMutationVariables,
  FindEntities,
  EntityType,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Entity/EntitiesCell'
import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { Button } from 'src/components/ui/button'
import { Checkbox } from 'src/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { truncate } from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_ENTITY_MUTATION: TypedDocumentNode<
  DeleteEntityMutation,
  DeleteEntityMutationVariables
> = gql`
  mutation DeleteEntityMutation($id: Int!) {
    deleteEntity(id: $id) {
      id
    }
  }
`

// Get all entity types from your Prisma enum
const ENTITY_TYPES: EntityType[] = ['CONTRACTOR', 'CLIENT', 'RETAILER', 'OTHER'] // Adjust based on your actual enum values

const EntitiesList = ({ entities }: FindEntities) => {
  const [selectedTypes, setSelectedTypes] = useState<Set<EntityType>>(
    new Set(ENTITY_TYPES)
  )

  const [deleteEntity] = useMutation(DELETE_ENTITY_MUTATION, {
    onCompleted: () => {
      toast.success('Entity deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteEntityMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete entity ' + id + '?')) {
      deleteEntity({ variables: { id } })
    }
  }

  const toggleType = (type: EntityType) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  const selectAll = () => setSelectedTypes(new Set(ENTITY_TYPES))
  const deselectAll = () => setSelectedTypes(new Set())

  const filteredEntities = entities.filter((entity) =>
    selectedTypes.has(entity.type)
  )

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredEntities.length} of {entities.length} entities
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={selectAll}>
                Select All
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={deselectAll}>
                Deselect All
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {ENTITY_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onSelect={(e) => {
                    e.preventDefault()
                    toggleType(type)
                  }}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedTypes.has(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span>{type}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <table className="rw-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntities.map((entity) => (
            <tr key={entity.id}>
              <td>
                <Link
                  to={routes.entity({ id: entity.id })}
                  title={'Show ' + entity.name + ' details'}
                >
                  {truncate(entity.name)}
                </Link>
              </td>
              <td>{truncate(entity.contactName)}</td>
              <td>{truncate(entity.email)}</td>
              <td>{truncate(entity.phone)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editEntity({ id: entity.id })}
                    title={'Edit ' + entity.name}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    title={'Delete ' + entity.name}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(entity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="mb-6" />
      <ExportButton
        label="Export All Entities"
        data={filteredEntities}
        filename={`${todayAsYYYYMMDD()}-entities.csv`}
      />
    </div>
  )
}

export default EntitiesList
