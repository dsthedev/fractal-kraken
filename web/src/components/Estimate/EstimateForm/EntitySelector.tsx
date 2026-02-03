import React, { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Entity } from 'types/graphql'

import { Form, Label, FieldError } from '@cedarjs/forms'

import EntityFields, {
  entityValidationSchema,
  type EntityFormValues,
} from 'src/components/Entity/EntityForm/EntityFields'
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

  const newDialogType = entityType === 'CONTRACTOR' ? 'INSTALLER' : entityType

  const editDefaultValues = useMemo<EntityFormValues>(
    () => ({
      type: selectedEntity?.type ?? newDialogType,
      name: selectedEntity?.name ?? '',
      nickname: selectedEntity?.nickname ?? '',
      contactName: selectedEntity?.contactName ?? '',
      email: selectedEntity?.email ?? '',
      phone: selectedEntity?.phone ?? '',
      addressLine1: selectedEntity?.addressLine1 ?? '',
      addressLine2: selectedEntity?.addressLine2 ?? '',
      city: selectedEntity?.city ?? '',
      state: selectedEntity?.state ?? '',
      postalCode: selectedEntity?.postalCode ?? '',
      country: selectedEntity?.country ?? '',
      notes: selectedEntity?.notes ?? '',
      isBusiness: selectedEntity?.isBusiness ?? false,
      usesNickname: selectedEntity?.usesNickname ?? false,
    }),
    [newDialogType, selectedEntity]
  )

  const editForm = useForm<EntityFormValues>({
    resolver: zodResolver(entityValidationSchema),
    defaultValues: editDefaultValues,
  })

  useEffect(() => {
    if (openEditDialog && selectedEntity) {
      editForm.reset(editDefaultValues)
    }
  }, [editDefaultValues, editForm, openEditDialog, selectedEntity])

  const handleEditOpen = () => {
    if (selectedEntity) {
      editForm.reset(editDefaultValues)
      setOpenEditDialog(true)
    }
  }

  const handleEditSubmit = (data: EntityFormValues) => {
    if (selectedEntity && onEntityUpdate) {
      const updatedEntity = { ...selectedEntity, ...data } as Entity
      onEntityUpdate(updatedEntity)
      setOpenEditDialog(false)
    }
  }

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
              <span className="truncate">{displayLabel}</span>
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
              <Form<EntityFormValues>
                onSubmit={handleEditSubmit}
                formMethods={editForm}
              >
                <div className="space-y-4">
                  <EntityFields
                    initialValues={editDefaultValues}
                    includeType={true}
                    showAddressLine2
                    showCountry
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenEditDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </div>
              </Form>
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
