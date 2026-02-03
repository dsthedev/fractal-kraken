import React, { useState } from 'react'

import { Pencil } from 'lucide-react'
import type { Entity } from 'types/graphql'

import { Label, FieldError } from '@cedarjs/forms'

import { Button } from 'src/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from 'src/components/ui/popover'
import NewEntityDialog from 'src/components/User/NewEntityDialog'
import { cn } from 'src/lib/utils'

interface EntitySelectorProps {
  label: string
  placeholder: string
  fieldName: string
  entityType: 'INSTALLER' | 'CLIENT' | 'RETAILER' | 'CONTRACTOR'
  entities?: Entity[]
  selectedEntity?: Partial<Entity> | null
  onEntitySelect: (entity: Entity | null) => void
  onEntityCreate?: (entity: Entity) => void
  onEntityUpdate?: (entity: Entity) => void
  hiddenInputValue: string | number
}

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  label,
  placeholder,
  fieldName,
  entityType,
  entities,
  selectedEntity,
  onEntitySelect,
  onEntityCreate,
  onEntityUpdate,
  hiddenInputValue,
}) => {
  const [openCombobox, setOpenCombobox] = useState(false)
  const [openNewDialog, setOpenNewDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editDraft, setEditDraft] = useState<Partial<Entity>>({})

  const displayLabel = selectedEntity
    ? selectedEntity.name
    : selectedEntity === null
      ? 'N/A'
      : placeholder

  const entityTypeFilters = {
    INSTALLER: ['INSTALLER', 'CONTRACTOR'],
    CLIENT: ['CLIENT', 'RETAILER', 'CONTRACTOR'],
    RETAILER: ['RETAILER', 'CONTRACTOR'],
    CONTRACTOR: ['CONTRACTOR', 'INSTALLER', 'CLIENT', 'RETAILER'],
  }

  const filteredEntities =
    entities?.filter((e) => entityTypeFilters[entityType]?.includes(e.type)) ||
    []

  const handleEditOpen = () => {
    if (selectedEntity) {
      setEditDraft({ ...selectedEntity })
      setOpenEditDialog(true)
    }
  }

  const handleEditSave = async () => {
    if (selectedEntity && onEntityUpdate) {
      const updatedEntity = { ...selectedEntity, ...editDraft } as Entity
      onEntityUpdate(updatedEntity)
      setOpenEditDialog(false)
    }
  }

  const newDialogType = entityType === 'CONTRACTOR' ? 'INSTALLER' : entityType

  return (
    <div>
      <Label
        name={fieldName}
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        {label}
      </Label>

      <div className="flex gap-2">
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className={cn(
                'flex-1 justify-between truncate',
                !selectedEntity && 'text-muted-foreground'
              )}
            >
              <span className="truncate">
                {displayLabel}
              </span>
              <svg
                className="ml-2 h-4 w-4 shrink-0 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-fit">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    key="none"
                    value="none"
                    onSelect={() => {
                      onEntitySelect(null)
                      setOpenCombobox(false)
                    }}
                  >
                    N/A
                  </CommandItem>
                  {filteredEntities.map((entity) => (
                    <CommandItem
                      key={entity.id}
                      value={entity.name}
                      onSelect={() => {
                        onEntitySelect(entity)
                        setOpenCombobox(false)
                      }}
                    >
                      {entity.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpenNewDialog(true)}
            >
              +
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New {label}</DialogTitle>
            </DialogHeader>
            <NewEntityDialog
              defaultType={newDialogType as any}
              onClose={() => setOpenNewDialog(false)}
              onCreated={(entity) => {
                if (onEntityCreate) {
                  onEntityCreate(entity as Entity)
                }
                setOpenNewDialog(false)
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!selectedEntity}
              title={`Edit selected ${label.toLowerCase()}`}
              onClick={handleEditOpen}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {label}</DialogTitle>
            </DialogHeader>
            {selectedEntity ? (
              <div className="space-y-4">
                {/* Name and Nickname row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-name`}
                    >
                      Name
                    </label>
                    <input
                      id={`edit-${fieldName}-name`}
                      className="rw-input"
                      value={editDraft.name ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-nickname`}
                    >
                      Nickname
                    </label>
                    <input
                      id={`edit-${fieldName}-nickname`}
                      className="rw-input"
                      value={editDraft.nickname ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          nickname: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Contact Name row */}
                <div>
                  <label
                    className="rw-label"
                    htmlFor={`edit-${fieldName}-contactName`}
                  >
                    Contact Name
                  </label>
                  <input
                    id={`edit-${fieldName}-contactName`}
                    className="rw-input"
                    value={editDraft.contactName ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        contactName: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Email and Phone row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-email`}
                    >
                      Email
                    </label>
                    <input
                      id={`edit-${fieldName}-email`}
                      type="email"
                      className="rw-input"
                      value={editDraft.email ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-phone`}
                    >
                      Phone
                    </label>
                    <input
                      id={`edit-${fieldName}-phone`}
                      className="rw-input"
                      value={editDraft.phone ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(XXX) XXX-XXXX"
                    />
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label
                    className="rw-label"
                    htmlFor={`edit-${fieldName}-address1`}
                  >
                    Address Line 1
                  </label>
                  <input
                    id={`edit-${fieldName}-address1`}
                    className="rw-input"
                    value={editDraft.addressLine1 ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        addressLine1: e.target.value,
                      }))
                    }
                    placeholder="Street address"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label
                    className="rw-label"
                    htmlFor={`edit-${fieldName}-address2`}
                  >
                    Address Line 2
                  </label>
                  <input
                    id={`edit-${fieldName}-address2`}
                    className="rw-input"
                    value={editDraft.addressLine2 ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        addressLine2: e.target.value,
                      }))
                    }
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                {/* City, State, Postal Code row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-city`}
                    >
                      City
                    </label>
                    <input
                      id={`edit-${fieldName}-city`}
                      className="rw-input"
                      value={editDraft.city ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-state`}
                    >
                      State
                    </label>
                    <input
                      id={`edit-${fieldName}-state`}
                      className="rw-input"
                      value={editDraft.state ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          state: e.target.value,
                        }))
                      }
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label
                      className="rw-label"
                      htmlFor={`edit-${fieldName}-postal`}
                    >
                      Postal Code
                    </label>
                    <input
                      id={`edit-${fieldName}-postal`}
                      className="rw-input"
                      value={editDraft.postalCode ?? ''}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          postalCode: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    className="rw-label"
                    htmlFor={`edit-${fieldName}-country`}
                  >
                    Country
                  </label>
                  <input
                    id={`edit-${fieldName}-country`}
                    className="rw-input"
                    value={editDraft.country ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        country: e.target.value,
                      }))
                    }
                    placeholder="US"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    className="rw-label"
                    htmlFor={`edit-${fieldName}-notes`}
                  >
                    Notes
                  </label>
                  <textarea
                    id={`edit-${fieldName}-notes`}
                    className="rw-input"
                    value={editDraft.notes ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOpenEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleEditSave}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No {label.toLowerCase()} selected.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <input type="hidden" name={fieldName} value={String(hiddenInputValue)} />
      <FieldError name={fieldName} className="rw-field-error" />
    </div>
  )
}

export default EntitySelector
