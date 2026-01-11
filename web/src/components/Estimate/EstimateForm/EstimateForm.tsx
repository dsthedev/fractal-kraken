import { useEffect, useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, Pencil, Trash2Icon } from 'lucide-react'
import type {
  EditEstimateById,
  UpdateEstimateInput,
  Entity,
  UpdateEntityMutationVariables,
} from 'types/graphql'
import { v4 as uuidv4 } from 'uuid'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  NumberField,
  Submit,
} from '@cedarjs/forms'
import type { TypedDocumentNode } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
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
import { cn, getWeekNumber } from 'src/lib/utils'

type FormEstimate = NonNullable<EditEstimateById['estimate']>

interface EstimateFormProps {
  estimate?: EditEstimateById['estimate']
  onSave: (data: UpdateEstimateInput, id?: FormEstimate['id']) => void
  error: RWGqlError
  loading: boolean
  entities?: Entity[]
}

// Helper function to build title from components
const buildTitle = (
  weekNumber: string,
  retailerName?: string,
  clientName?: string
): string => {
  const parts = [weekNumber]
  if (retailerName) parts.push(retailerName)
  if (clientName) parts.push(clientName)
  return parts.join(' - ')
}

const UPDATE_ENTITY_MUTATION: TypedDocumentNode<
  { updateEntity: Entity },
  UpdateEntityMutationVariables
> = gql`
  mutation UpdateEntityInEstimateForm($id: Int!, $input: UpdateEntityInput!) {
    updateEntity(id: $id, input: $input) {
      id
      type
      name
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
    }
  }
`

const EstimateForm = (props: EstimateFormProps) => {
  const { currentUser } = useAuth()
  const [updateEntity] = useMutation(UPDATE_ENTITY_MUTATION, {
    onCompleted: () => {
      toast.success('Entity updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  const [openStatus, setOpenStatus] = useState(false)
  const [openRetailer, setOpenRetailer] = useState(false)
  const [openClient, setOpenClient] = useState(false)
  const [openInstaller, setOpenInstaller] = useState(false)
  const [openNewInstaller, setOpenNewInstaller] = useState(false)
  const [openNewClient, setOpenNewClient] = useState(false)
  const [openNewRetailer, setOpenNewRetailer] = useState(false)
  const [openEditInstaller, setOpenEditInstaller] = useState(false)
  const [openEditClient, setOpenEditClient] = useState(false)
  const [openEditRetailer, setOpenEditRetailer] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateEstimateInput['status']
  >(props.estimate?.status || 'DRAFT')
  const [selectedRetailerEntity, setSelectedRetailerEntity] = useState<
    EditEstimateById['estimate']['retailerEntity']
  >(props.estimate?.retailerEntity || undefined)
  const [selectedClientEntity, setSelectedClientEntity] = useState<
    EditEstimateById['estimate']['clientEntity']
  >(props.estimate?.clientEntity || undefined)
  const [selectedInstallerEntity, setSelectedInstallerEntity] = useState<
    EditEstimateById['estimate']['installerEntity']
  >(props.estimate?.installerEntity || undefined)

  // Simple inline editing state for entity dialogs
  const [editInstallerDraft, setEditInstallerDraft] = useState<Partial<Entity>>(
    {}
  )
  const [editClientDraft, setEditClientDraft] = useState<Partial<Entity>>({})
  const [editRetailerDraft, setEditRetailerDraft] = useState<Partial<Entity>>(
    {}
  )

  useEffect(() => {
    if (openEditInstaller && selectedInstallerEntity) {
      setEditInstallerDraft({ ...selectedInstallerEntity })
    }
  }, [openEditInstaller, selectedInstallerEntity])
  useEffect(() => {
    if (openEditClient && selectedClientEntity) {
      setEditClientDraft({ ...selectedClientEntity })
    }
  }, [openEditClient, selectedClientEntity])
  useEffect(() => {
    if (openEditRetailer && selectedRetailerEntity) {
      setEditRetailerDraft({ ...selectedRetailerEntity })
    }
  }, [openEditRetailer, selectedRetailerEntity])

  // Billable items local scaffold (not persisted yet)
  type LocalItem = { id: string; name: string; qty: number; rate: number }
  const [billableItems, setBillableItems] = useState<LocalItem[]>([])
  const itemsTotal = useMemo(
    () => billableItems.reduce((sum, it) => sum + it.qty * it.rate, 0),
    [billableItems]
  )

  const isNewEstimate = !props.estimate
  const weekNumber = getWeekNumber(new Date())
  const currentTitle = buildTitle(
    weekNumber,
    selectedRetailerEntity?.name,
    selectedClientEntity?.name
  )

  const onSubmit = (data: FormEstimate) => {
    // Ensure required fields are set properly
    const submitData = {
      ...data,
      uuid: data.uuid || uuidv4(),
      status: selectedStatus,
      installerEntityId: selectedInstallerEntity?.id,
      clientEntityId: selectedClientEntity?.id,
      retailerEntityId: selectedRetailerEntity?.id,
      authorId: currentUser?.id || data.authorId,
      jobCountry: 'United States',
    }
    props.onSave(submitData, props?.estimate?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormEstimate> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* UUID - Visually hidden, auto-generated for new estimates */}
        <TextField
          name="uuid"
          defaultValue={props.estimate?.uuid || uuidv4()}
          className="hidden"
          errorClassName="hidden"
          validation={{ required: true }}
        />

        {/* Title + Status in one row */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label
              name="title"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Title
            </Label>

            <TextField
              name="title"
              defaultValue={
                isNewEstimate ? currentTitle : props.estimate?.title
              }
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              readOnly={isNewEstimate}
            />

            <FieldError name="title" className="rw-field-error" />
          </div>

          <div className="w-48 ml-auto">
            <Label
              name="status"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Status
            </Label>

            <div className="flex">
              <Popover open={openStatus} onOpenChange={setOpenStatus}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatus}
                    className={cn(
                      'justify-between w-full',
                      !selectedStatus && 'text-muted-foreground'
                    )}
                  >
                    {selectedStatus || 'Draft'}
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
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {[
                          'DRAFT',
                          'SENT',
                          'ACCEPTED',
                          'REJECTED',
                          'EXPIRED',
                        ].map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={(value) => {
                              setSelectedStatus(
                                value as UpdateEstimateInput['status']
                              )
                              setOpenStatus(false)
                            }}
                          >
                            {status}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <input type="hidden" name="status" value={selectedStatus} />
            <FieldError name="status" className="rw-field-error" />
          </div>
        </div>

        {/* Installer Entity - Combobox with New Entity button */}
        <Label
          name="installerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Installer
        </Label>

        <div className="flex gap-2">
          <Popover open={openInstaller} onOpenChange={setOpenInstaller}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openInstaller}
                className={cn(
                  'flex-1 justify-between',
                  !selectedInstallerEntity && 'text-muted-foreground'
                )}
              >
                {selectedInstallerEntity?.name || 'Select installer...'}
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
                <CommandInput placeholder="Search installers..." />
                <CommandEmpty>No installers found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {props.entities
                      ?.filter((e) =>
                        ['INSTALLER', 'CONTRACTOR'].includes(e.type)
                      )
                      .map((entity) => (
                        <CommandItem
                          key={entity.id}
                          value={entity.name}
                          onSelect={() => {
                            setSelectedInstallerEntity(entity)
                            setOpenInstaller(false)
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

          <Dialog open={openNewInstaller} onOpenChange={setOpenNewInstaller}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpenNewInstaller(true)}
              >
                +
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Installer</DialogTitle>
              </DialogHeader>
              <NewEntityDialog
                defaultType="INSTALLER"
                onClose={() => setOpenNewInstaller(false)}
                onCreated={(entity) => {
                  setSelectedInstallerEntity(entity as Entity)
                  setOpenNewInstaller(false)
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openEditInstaller} onOpenChange={setOpenEditInstaller}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedInstallerEntity}
                title="Edit selected installer"
                onClick={() => setOpenEditInstaller(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Installer</DialogTitle>
              </DialogHeader>
              {selectedInstallerEntity ? (
                <div className="space-y-2">
                  <div>
                    <label className="rw-label" htmlFor="edit-installer-name">
                      Name
                    </label>
                    <input
                      id="edit-installer-name"
                      className="rw-input"
                      value={editInstallerDraft.name ?? ''}
                      onChange={(e) =>
                        setEditInstallerDraft((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-installer-address1"
                      >
                        Address Line 1
                      </label>
                      <input
                        id="edit-installer-address1"
                        className="rw-input"
                        value={editInstallerDraft.addressLine1 ?? ''}
                        onChange={(e) =>
                          setEditInstallerDraft((d) => ({
                            ...d,
                            addressLine1: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-installer-address2"
                      >
                        Address Line 2
                      </label>
                      <input
                        id="edit-installer-address2"
                        className="rw-input"
                        value={editInstallerDraft.addressLine2 ?? ''}
                        onChange={(e) =>
                          setEditInstallerDraft((d) => ({
                            ...d,
                            addressLine2: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3">
                      <label className="rw-label" htmlFor="edit-installer-city">
                        City
                      </label>
                      <input
                        id="edit-installer-city"
                        className="rw-input"
                        value={editInstallerDraft.city ?? ''}
                        onChange={(e) =>
                          setEditInstallerDraft((d) => ({
                            ...d,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-installer-state"
                      >
                        State
                      </label>
                      <input
                        id="edit-installer-state"
                        className="rw-input"
                        value={editInstallerDraft.state ?? ''}
                        onChange={(e) =>
                          setEditInstallerDraft((d) => ({
                            ...d,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        className="rw-label"
                        htmlFor="edit-installer-postal"
                      >
                        Postal Code
                      </label>
                      <input
                        id="edit-installer-postal"
                        className="rw-input"
                        value={editInstallerDraft.postalCode ?? ''}
                        onChange={(e) =>
                          setEditInstallerDraft((d) => ({
                            ...d,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setOpenEditInstaller(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (selectedInstallerEntity) {
                          await updateEntity({
                            variables: {
                              id: selectedInstallerEntity.id,
                              input: {
                                name: editInstallerDraft.name,
                                addressLine1: editInstallerDraft.addressLine1,
                                addressLine2: editInstallerDraft.addressLine2,
                                city: editInstallerDraft.city,
                                state: editInstallerDraft.state,
                                postalCode: editInstallerDraft.postalCode,
                              },
                            },
                          })
                          setSelectedInstallerEntity((prev) =>
                            prev
                              ? { ...prev, ...(editInstallerDraft as Entity) }
                              : prev
                          )
                        }
                        setOpenEditInstaller(false)
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No installer selected.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <input
          type="hidden"
          name="installerEntityId"
          value={
            selectedInstallerEntity?.id ||
            props.estimate?.installerEntityId ||
            ''
          }
        />

        <FieldError name="installerEntityId" className="rw-field-error" />

        {/* Client Entity - Combobox with New Entity button */}
        <Label
          name="clientEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Client
        </Label>

        <div className="flex gap-2">
          <Popover open={openClient} onOpenChange={setOpenClient}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClient}
                className={cn(
                  'flex-1 justify-between',
                  !selectedClientEntity && 'text-muted-foreground'
                )}
              >
                {selectedClientEntity?.name || 'Select client...'}
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
                <CommandInput placeholder="Search clients..." />
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {props.entities
                      ?.filter((e) => ['CLIENT'].includes(e.type))
                      .map((entity) => (
                        <CommandItem
                          key={entity.id}
                          value={entity.name}
                          onSelect={() => {
                            setSelectedClientEntity(entity)
                            setOpenClient(false)
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

          <Dialog open={openNewClient} onOpenChange={setOpenNewClient}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpenNewClient(true)}
              >
                +
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <NewEntityDialog
                defaultType="CLIENT"
                onClose={() => setOpenNewClient(false)}
                onCreated={(entity) => {
                  setSelectedClientEntity(entity as Entity)
                  setOpenNewClient(false)
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openEditClient} onOpenChange={setOpenEditClient}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedClientEntity}
                title="Edit selected client"
                onClick={() => setOpenEditClient(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
              </DialogHeader>
              {selectedClientEntity ? (
                <div className="space-y-2">
                  <div>
                    <label className="rw-label" htmlFor="edit-client-name">
                      Name
                    </label>
                    <input
                      id="edit-client-name"
                      className="rw-input"
                      value={editClientDraft.name ?? ''}
                      onChange={(e) =>
                        setEditClientDraft((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-client-address1"
                      >
                        Address Line 1
                      </label>
                      <input
                        id="edit-client-address1"
                        className="rw-input"
                        value={editClientDraft.addressLine1 ?? ''}
                        onChange={(e) =>
                          setEditClientDraft((d) => ({
                            ...d,
                            addressLine1: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-client-address2"
                      >
                        Address Line 2
                      </label>
                      <input
                        id="edit-client-address2"
                        className="rw-input"
                        value={editClientDraft.addressLine2 ?? ''}
                        onChange={(e) =>
                          setEditClientDraft((d) => ({
                            ...d,
                            addressLine2: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3">
                      <label className="rw-label" htmlFor="edit-client-city">
                        City
                      </label>
                      <input
                        id="edit-client-city"
                        className="rw-input"
                        value={editClientDraft.city ?? ''}
                        onChange={(e) =>
                          setEditClientDraft((d) => ({
                            ...d,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="rw-label" htmlFor="edit-client-state">
                        State
                      </label>
                      <input
                        id="edit-client-state"
                        className="rw-input"
                        value={editClientDraft.state ?? ''}
                        onChange={(e) =>
                          setEditClientDraft((d) => ({
                            ...d,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="rw-label" htmlFor="edit-client-postal">
                        Postal Code
                      </label>
                      <input
                        id="edit-client-postal"
                        className="rw-input"
                        value={editClientDraft.postalCode ?? ''}
                        onChange={(e) =>
                          setEditClientDraft((d) => ({
                            ...d,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setOpenEditClient(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (selectedClientEntity) {
                          await updateEntity({
                            variables: {
                              id: selectedClientEntity.id,
                              input: {
                                name: editClientDraft.name,
                                addressLine1: editClientDraft.addressLine1,
                                addressLine2: editClientDraft.addressLine2,
                                city: editClientDraft.city,
                                state: editClientDraft.state,
                                postalCode: editClientDraft.postalCode,
                              },
                            },
                          })
                          setSelectedClientEntity((prev) =>
                            prev
                              ? { ...prev, ...(editClientDraft as Entity) }
                              : prev
                          )
                        }
                        setOpenEditClient(false)
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No client selected.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <input
          type="hidden"
          name="clientEntityId"
          value={
            selectedClientEntity?.id || props.estimate?.clientEntityId || ''
          }
        />

        <FieldError name="clientEntityId" className="rw-field-error" />

        {/* Retailer Entity - Combobox with New Entity button */}
        <Label
          name="retailerEntityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Retailer
        </Label>

        <div className="flex gap-2">
          <Popover open={openRetailer} onOpenChange={setOpenRetailer}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRetailer}
                className={cn(
                  'flex-1 justify-between',
                  !selectedRetailerEntity && 'text-muted-foreground'
                )}
              >
                {selectedRetailerEntity?.name || 'Select retailer...'}
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
                <CommandInput placeholder="Search retailers..." />
                <CommandEmpty>No retailers found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {props.entities
                      ?.filter((e) => ['RETAILER'].includes(e.type))
                      .map((entity) => (
                        <CommandItem
                          key={entity.id}
                          value={entity.name}
                          onSelect={() => {
                            setSelectedRetailerEntity(entity)
                            setOpenRetailer(false)
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

          <Dialog open={openNewRetailer} onOpenChange={setOpenNewRetailer}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpenNewRetailer(true)}
              >
                +
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Retailer</DialogTitle>
              </DialogHeader>
              <NewEntityDialog
                defaultType="RETAILER"
                onClose={() => setOpenNewRetailer(false)}
                onCreated={(entity) => {
                  setSelectedRetailerEntity(entity as Entity)
                  setOpenNewRetailer(false)
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openEditRetailer} onOpenChange={setOpenEditRetailer}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedRetailerEntity}
                title="Edit selected retailer"
                onClick={() => setOpenEditRetailer(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Retailer</DialogTitle>
              </DialogHeader>
              {selectedRetailerEntity ? (
                <div className="space-y-2">
                  <div>
                    <label className="rw-label" htmlFor="edit-retailer-name">
                      Name
                    </label>
                    <input
                      id="edit-retailer-name"
                      className="rw-input"
                      value={editRetailerDraft.name ?? ''}
                      onChange={(e) =>
                        setEditRetailerDraft((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-retailer-address1"
                      >
                        Address Line 1
                      </label>
                      <input
                        id="edit-retailer-address1"
                        className="rw-input"
                        value={editRetailerDraft.addressLine1 ?? ''}
                        onChange={(e) =>
                          setEditRetailerDraft((d) => ({
                            ...d,
                            addressLine1: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className="rw-label"
                        htmlFor="edit-retailer-address2"
                      >
                        Address Line 2
                      </label>
                      <input
                        id="edit-retailer-address2"
                        className="rw-input"
                        value={editRetailerDraft.addressLine2 ?? ''}
                        onChange={(e) =>
                          setEditRetailerDraft((d) => ({
                            ...d,
                            addressLine2: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3">
                      <label className="rw-label" htmlFor="edit-retailer-city">
                        City
                      </label>
                      <input
                        id="edit-retailer-city"
                        className="rw-input"
                        value={editRetailerDraft.city ?? ''}
                        onChange={(e) =>
                          setEditRetailerDraft((d) => ({
                            ...d,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="rw-label" htmlFor="edit-retailer-state">
                        State
                      </label>
                      <input
                        id="edit-retailer-state"
                        className="rw-input"
                        value={editRetailerDraft.state ?? ''}
                        onChange={(e) =>
                          setEditRetailerDraft((d) => ({
                            ...d,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        className="rw-label"
                        htmlFor="edit-retailer-postal"
                      >
                        Postal Code
                      </label>
                      <input
                        id="edit-retailer-postal"
                        className="rw-input"
                        value={editRetailerDraft.postalCode ?? ''}
                        onChange={(e) =>
                          setEditRetailerDraft((d) => ({
                            ...d,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setOpenEditRetailer(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (selectedRetailerEntity) {
                          await updateEntity({
                            variables: {
                              id: selectedRetailerEntity.id,
                              input: {
                                name: editRetailerDraft.name,
                                addressLine1: editRetailerDraft.addressLine1,
                                addressLine2: editRetailerDraft.addressLine2,
                                city: editRetailerDraft.city,
                                state: editRetailerDraft.state,
                                postalCode: editRetailerDraft.postalCode,
                              },
                            },
                          })
                          setSelectedRetailerEntity((prev) =>
                            prev
                              ? { ...prev, ...(editRetailerDraft as Entity) }
                              : prev
                          )
                        }
                        setOpenEditRetailer(false)
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No retailer selected.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <input
          type="hidden"
          name="retailerEntityId"
          value={
            selectedRetailerEntity?.id || props.estimate?.retailerEntityId || ''
          }
        />

        <FieldError name="retailerEntityId" className="rw-field-error" />

        {/* Job Location - grouped address layout, auto-filled from client */}
        <fieldset
          key={selectedClientEntity?.id || 'no-client'}
          className="mt-4 space-y-2"
        >
          <legend className="text-sm font-medium">Job Location</legend>

          <div>
            <Label
              name="jobAddressLine1"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Address Line 1
            </Label>

            <TextField
              name="jobAddressLine1"
              defaultValue={
                selectedClientEntity?.addressLine1 ||
                props.estimate?.jobAddressLine1
              }
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="jobAddressLine1" className="rw-field-error" />
          </div>

          <div>
            <Label
              name="jobAddressLine2"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Address Line 2
            </Label>

            <TextField
              name="jobAddressLine2"
              defaultValue={
                selectedClientEntity?.addressLine2 ||
                props.estimate?.jobAddressLine2
              }
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />

            <FieldError name="jobAddressLine2" className="rw-field-error" />
          </div>

          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-3">
              <Label
                name="jobCity"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                City
              </Label>

              <TextField
                name="jobCity"
                defaultValue={
                  selectedClientEntity?.city || props.estimate?.jobCity
                }
                className="rw-input"
                errorClassName="rw-input rw-input-error"
              />

              <FieldError name="jobCity" className="rw-field-error" />
            </div>

            <div className="col-span-1">
              <Label
                name="jobState"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                State
              </Label>

              <TextField
                name="jobState"
                defaultValue={
                  selectedClientEntity?.state || props.estimate?.jobState
                }
                className="rw-input"
                errorClassName="rw-input rw-input-error"
              />

              <FieldError name="jobState" className="rw-field-error" />
            </div>

            <div className="col-span-2">
              <Label
                name="jobPostalCode"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Postal Code
              </Label>

              <TextField
                name="jobPostalCode"
                defaultValue={
                  selectedClientEntity?.postalCode ||
                  props.estimate?.jobPostalCode
                }
                className="rw-input"
                errorClassName="rw-input rw-input-error"
              />

              <FieldError name="jobPostalCode" className="rw-field-error" />
            </div>
          </div>

          {/* Hidden country defaults to United States */}
          <input type="hidden" name="jobCountry" value="United States" />
        </fieldset>

        {/* Billable Items Section (scaffold) */}
        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-medium">Billable Items</legend>

          {billableItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No items yet. Add your first line item.
            </div>
          ) : (
            <div className="space-y-2">
              {billableItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-5">
                    <label
                      className="rw-label"
                      htmlFor={`billable-item-${idx}-name`}
                    >
                      Item
                    </label>
                    <input
                      id={`billable-item-${idx}-name`}
                      className="rw-input"
                      value={item.name}
                      onChange={(e) => {
                        const v = e.target.value
                        setBillableItems((prev) => {
                          const next = [...prev]
                          next[idx] = { ...next[idx], name: v }
                          return next
                        })
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      className="rw-label"
                      htmlFor={`billable-item-${idx}-qty`}
                    >
                      Qty
                    </label>
                    <input
                      id={`billable-item-${idx}-qty`}
                      type="number"
                      className="rw-input"
                      value={item.qty}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0)
                        setBillableItems((prev) => {
                          const next = [...prev]
                          next[idx] = { ...next[idx], qty: v }
                          return next
                        })
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      className="rw-label"
                      htmlFor={`billable-item-${idx}-rate`}
                    >
                      Rate
                    </label>
                    <input
                      id={`billable-item-${idx}-rate`}
                      type="number"
                      className="rw-input"
                      value={item.rate}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0)
                        setBillableItems((prev) => {
                          const next = [...prev]
                          next[idx] = { ...next[idx], rate: v }
                          return next
                        })
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="rw-label">Total</span>
                    <div className="rw-input bg-muted/40" aria-live="polite">
                      {(item.qty * item.rate).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex gap-1 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Move up"
                      disabled={idx === 0}
                      onClick={() => {
                        setBillableItems((prev) => {
                          const next = [...prev]
                          const tmp = next[idx - 1]
                          next[idx - 1] = next[idx]
                          next[idx] = tmp
                          return next
                        })
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Move down"
                      disabled={idx === billableItems.length - 1}
                      onClick={() => {
                        setBillableItems((prev) => {
                          const next = [...prev]
                          const tmp = next[idx + 1]
                          next[idx + 1] = next[idx]
                          next[idx] = tmp
                          return next
                        })
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Remove"
                      onClick={() =>
                        setBillableItems((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Items subtotal: {itemsTotal.toFixed(2)}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setBillableItems((prev) => [
                  ...prev,
                  { id: uuidv4(), name: '', qty: 1, rate: 0 },
                ])
              }
            >
              Add Item
            </Button>
          </div>

          {/* Pass items as JSON for now; backend wiring can parse later */}
          <input
            type="hidden"
            name="billableItemsJson"
            value={JSON.stringify(billableItems)}
          />
        </fieldset>

        {/* Author ID - Visually hidden, auto-populated from current user */}
        <input type="hidden" name="authorId" value={currentUser?.id || ''} />

        <Label
          name="subtotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Subtotal
        </Label>

        <TextField
          name="subtotal"
          defaultValue={props.estimate?.subtotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="subtotal" className="rw-field-error" />

        <Label
          name="taxTotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Tax Total
        </Label>

        <TextField
          name="taxTotal"
          defaultValue={props.estimate?.taxTotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="taxTotal" className="rw-field-error" />

        <Label
          name="total"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total
        </Label>

        <TextField
          name="total"
          defaultValue={props.estimate?.total}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsNumber: true, required: true }}
        />

        <FieldError name="total" className="rw-field-error" />

        <Label
          name="estimatedMinutesTotal"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estimated Minutes Total
        </Label>

        <NumberField
          name="estimatedMinutesTotal"
          defaultValue={props.estimate?.estimatedMinutesTotal}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="estimatedMinutesTotal" className="rw-field-error" />

        <Label
          name="notes"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Notes
        </Label>

        <TextField
          name="notes"
          defaultValue={props.estimate?.notes}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="notes" className="rw-field-error" />

        <Label
          name="entityId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Entity ID
        </Label>

        <NumberField
          name="entityId"
          defaultValue={props.estimate?.entityId}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          emptyAs={'undefined'}
        />

        <FieldError name="entityId" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EstimateForm
