import { useState } from 'react'

import { Pencil, Trash2, Filter, ChevronRight, Mail, Phone, User } from 'lucide-react'
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from 'src/components/ui/drawer'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'src/components/ui/hover-card'
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

// Reusable details content component for both Drawer and HoverCard
const EntityDetailsContent = ({ entity }: { entity: FindEntities[0] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <User className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">Contact</p>
        <p className="text-sm font-medium">{truncate(entity.contactName)}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">Email</p>
        <a
          href={`mailto:${entity.email}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {truncate(entity.email)}
        </a>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Phone className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">Phone</p>
        <a
          href={`tel:${entity.phone}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {truncate(entity.phone)}
        </a>
      </div>
    </div>
    <div className="pt-2 border-t">
      <Link
        to={routes.entity({ id: entity.id })}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        More Details →
      </Link>
    </div>
  </div>
)

const EntitiesList = ({ entities }: FindEntities) => {
  const [selectedTypes, setSelectedTypes] = useState<Set<EntityType>>(
    new Set(ENTITY_TYPES)
  )
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null)

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
            <th className="hidden sm:table-cell">Contact</th>
            <th className="hidden sm:table-cell">Email</th>
            <th className="hidden sm:table-cell">Phone</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntities.map((entity) => (
            <tr key={entity.id}>
              <td>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-sm font-medium text-blue-600 hover:underline hidden sm:inline">
                      {truncate(entity.name)}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64">
                    <EntityDetailsContent entity={entity} />
                  </HoverCardContent>
                </HoverCard>
                <button
                  type="button"
                  title={'Details for ' + entity.name}
                  className="text-sm font-medium text-blue-600 hover:underline sm:hidden"
                  onClick={() => setOpenDrawerId(entity.id)}
                >
                  {truncate(entity.name)}
                </button>
              </td>
              <td className="hidden sm:table-cell">
                <span className="text-sm">{truncate(entity.contactName)}</span>
              </td>
              <td className="hidden sm:table-cell">
                <a
                  href={`mailto:${entity.email}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {truncate(entity.email)}
                </a>
              </td>
              <td className="hidden sm:table-cell">
                <a
                  href={`tel:${entity.phone}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {truncate(entity.phone)}
                </a>
              </td>
              <td>
                <nav className="rw-table-actions flex flex-wrap gap-1 sm:flex-nowrap">
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

      {/* Drawer for mobile details view */}
      {filteredEntities.map((entity) => (
        <Drawer
          key={`drawer-${entity.id}`}
          open={openDrawerId === entity.id}
          onOpenChange={(open) => setOpenDrawerId(open ? entity.id : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{entity.name}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <EntityDetailsContent entity={entity} />
            </div>
            <DrawerClose />
          </DrawerContent>
        </Drawer>
      ))}

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
