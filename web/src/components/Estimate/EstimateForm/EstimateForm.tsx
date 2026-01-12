import React, { useEffect, useMemo, useState } from 'react'

import { gql } from '@apollo/client'
import { ArrowDown, ArrowUp, Pencil, Trash2Icon } from 'lucide-react'
import type {
  EditEstimateById,
  UpdateEstimateInput,
  Entity,
  UpdateEntityMutationVariables,
  BillableItem,
  CreateBillableItemInput,
  CreateBillableItemMutationVariables,
  UpdateBillableItemInput,
  UpdateBillableItemMutationVariables,
  DeleteBillableItemMutationVariables,
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
import BillableItemFormWrapper from 'src/components/BillableItem/BillableItemFormWrapper'
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
import { cn, getWeekNumber } from 'src/lib/utils'

import { EntitySelector } from './EntitySelector'

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

const CREATE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  { createBillableItem: BillableItem },
  CreateBillableItemMutationVariables
> = gql`
  mutation CreateBillableItemForEstimate($input: CreateBillableItemInput!) {
    createBillableItem(input: $input) {
      id
      serviceId
      unitId
      unitPrice
      pricingType
      quantity
      subtotal
      estimatedMinutesPerUnit
      notes
      sortOrder
      estimateId
      authorId
      service {
        id
        action
        material
        context
        description
      }
      unit {
        id
        shortName
        fullName
      }
    }
  }
`

const UPDATE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  { updateBillableItem: BillableItem },
  UpdateBillableItemMutationVariables
> = gql`
  mutation UpdateBillableItemInEstimate(
    $id: Int!
    $input: UpdateBillableItemInput!
  ) {
    updateBillableItem(id: $id, input: $input) {
      id
      serviceId
      unitId
      unitPrice
      pricingType
      quantity
      subtotal
      estimatedMinutesPerUnit
      notes
      sortOrder
      estimateId
      authorId
      service {
        id
        action
        material
        context
        description
      }
      unit {
        id
        shortName
        fullName
      }
    }
  }
`

const DELETE_BILLABLE_ITEM_MUTATION: TypedDocumentNode<
  { deleteBillableItem: BillableItem },
  DeleteBillableItemMutationVariables
> = gql`
  mutation DeleteBillableItemFromEstimate($id: Int!) {
    deleteBillableItem(id: $id) {
      id
    }
  }
`

interface TitleSectionProps {
  titleValue: string
  onTitleChange: (value: string) => void
  weekNumber: string
  selectedRetailerEntity?: Partial<Entity>
  selectedClientEntity?: Partial<Entity>
}

const TitleSection: React.FC<TitleSectionProps> = ({
  titleValue,
  onTitleChange,
  weekNumber,
  selectedRetailerEntity,
  selectedClientEntity,
}) => {
  return (
    <div className="flex-1">
      <Label
        name="title"
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        Title
      </Label>

      <div className="flex gap-2">
        <input
          name="title"
          type="text"
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          className="rw-input flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newTitle = buildTitle(
              weekNumber,
              selectedRetailerEntity?.name,
              selectedClientEntity?.name
            )
            onTitleChange(newTitle)
          }}
        >
          Generate
        </Button>
      </div>

      <FieldError name="title" className="rw-field-error" />
    </div>
  )
}

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

  const [
    createBillableItem,
    { loading: createBillableItemLoading, error: createBillableItemError },
  ] = useMutation(CREATE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => toast.success('Line item added'),
    onError: (error) => toast.error(error.message),
  })

  const [
    updateBillableItem,
    { loading: updateBillableItemLoading, error: updateBillableItemError },
  ] = useMutation(UPDATE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => toast.success('Line item updated'),
    onError: (error) => toast.error(error.message),
  })

  const [deleteBillableItem] = useMutation(DELETE_BILLABLE_ITEM_MUTATION, {
    onCompleted: () => toast.success('Line item deleted'),
    onError: (error) => toast.error(error.message),
  })

  const [openStatus, setOpenStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateEstimateInput['status']
  >(props.estimate?.status || 'DRAFT')
  const [selectedRetailerEntity, setSelectedRetailerEntity] = useState<
    Partial<Entity>
  >((props.estimate?.retailerEntity as Partial<Entity> | undefined) || {})
  const [selectedClientEntity, setSelectedClientEntity] = useState<
    Partial<Entity>
  >((props.estimate?.clientEntity as Partial<Entity> | undefined) || {})
  const [selectedInstallerEntity, setSelectedInstallerEntity] = useState<
    Partial<Entity>
  >((props.estimate?.installerEntity as Partial<Entity> | undefined) || {})
  const [titleValue, setTitleValue] = useState(
    props.estimate?.title ||
      buildTitle(
        getWeekNumber(new Date()),
        props.estimate?.retailerEntity?.name,
        props.estimate?.clientEntity?.name
      )
  )

  const [openNewBillableItem, setOpenNewBillableItem] = useState(false)
  const [editingBillableItem, setEditingBillableItem] =
    useState<BillableItem | null>(null)
  const [billableItems, setBillableItems] = useState<BillableItem[]>([])

  const weekNumber = getWeekNumber(new Date())

  useEffect(() => {
    if (props.estimate?.billableItems) {
      const sorted = [...(props.estimate.billableItems as BillableItem[])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id
      )
      setBillableItems(sorted)
    } else {
      setBillableItems([])
    }
  }, [props.estimate?.billableItems])

  const itemsTotal = useMemo(
    () => billableItems.reduce((sum, it) => sum + Number(it.subtotal || 0), 0),
    [billableItems]
  )

  const isPersistedEstimate = Boolean(props.estimate?.id)

  const formatMoney = (value?: number | null) => Number(value ?? 0).toFixed(2)

  const serviceLabel = (item: BillableItem) => {
    const context = item.service?.context ? ` (${item.service.context})` : ''
    const base = [item.service?.action, item.service?.material]
      .filter(Boolean)
      .join(' ')
    return `${base}${context}` || '—'
  }

  const handleCreateBillableItem = async (
    input: CreateBillableItemInput
  ): Promise<void> => {
    if (!props.estimate?.id) {
      toast.error('Save the estimate before adding items')
      return
    }

    const nextSortOrder = billableItems.length

    const { data } = await createBillableItem({
      variables: {
        input: {
          ...input,
          estimateId: props.estimate.id,
          sortOrder: nextSortOrder,
        },
      },
    })

    if (data?.createBillableItem) {
      setBillableItems((prev) => [...prev, data.createBillableItem])
      setOpenNewBillableItem(false)
    }
  }

  const handleUpdateBillableItem = async (
    input: UpdateBillableItemInput,
    id?: number
  ) => {
    const targetId = id ?? editingBillableItem?.id
    if (!targetId) return

    const { data } = await updateBillableItem({
      variables: { id: targetId, input },
    })

    if (data?.updateBillableItem) {
      setBillableItems((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, ...data.updateBillableItem } : item
        )
      )
      setEditingBillableItem(null)
    }
  }

  const handleDeleteBillableItem = async (id: number) => {
    await deleteBillableItem({ variables: { id } })
    const remaining = billableItems.filter((item) => item.id !== id)
    const normalized = remaining.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }))
    setBillableItems(normalized)
    await Promise.all(
      normalized.map((item) =>
        updateBillableItem({
          variables: { id: item.id, input: { sortOrder: item.sortOrder } },
        })
      )
    )
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= billableItems.length) return

    const next = billableItems.slice()
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    const normalized = next.map((item, idx) => ({ ...item, sortOrder: idx }))
    setBillableItems(normalized)

    await Promise.all(
      normalized.map((item) =>
        updateBillableItem({
          variables: { id: item.id, input: { sortOrder: item.sortOrder } },
        })
      )
    )
  }

  const onSubmit = (data: FormEstimate) => {
    // Ensure required fields are set properly
    const submitData = {
      ...data,
      title: titleValue,
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
          <TitleSection
            titleValue={titleValue}
            onTitleChange={setTitleValue}
            weekNumber={weekNumber}
            selectedRetailerEntity={selectedRetailerEntity}
            selectedClientEntity={selectedClientEntity}
          />

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

        {/* Installer Entity - Using EntitySelector */}
        <EntitySelector
          label="Installer"
          placeholder="Select installer..."
          fieldName="installerEntityId"
          entityType="INSTALLER"
          entities={props.entities}
          selectedEntity={selectedInstallerEntity}
          onEntitySelect={setSelectedInstallerEntity}
          onEntityUpdate={async (entity) => {
            const fields: (keyof Entity)[] = [
              'name',
              'addressLine1',
              'addressLine2',
              'city',
              'state',
              'postalCode',
            ]
            const updateInput = fields.reduce((acc, field) => {
              if (entity[field] !== undefined) {
                acc[field] = entity[field]
              }
              return acc
            }, {} as any)
            await updateEntity({
              variables: {
                id: entity.id,
                input: updateInput,
              },
            })
            setSelectedInstallerEntity(entity)
          }}
          hiddenInputValue={
            selectedInstallerEntity?.id ||
            props.estimate?.installerEntityId ||
            ''
          }
        />

        {/* Client Entity - Using EntitySelector */}
        <EntitySelector
          label="Client"
          placeholder="Select client..."
          fieldName="clientEntityId"
          entityType="CLIENT"
          entities={props.entities}
          selectedEntity={selectedClientEntity}
          onEntitySelect={setSelectedClientEntity}
          onEntityUpdate={async (entity) => {
            const fields: (keyof Entity)[] = [
              'name',
              'addressLine1',
              'addressLine2',
              'city',
              'state',
              'postalCode',
            ]
            const updateInput = fields.reduce((acc, field) => {
              if (entity[field] !== undefined) {
                acc[field] = entity[field]
              }
              return acc
            }, {} as any)
            await updateEntity({
              variables: {
                id: entity.id,
                input: updateInput,
              },
            })
            setSelectedClientEntity(entity)
          }}
          hiddenInputValue={
            selectedClientEntity?.id || props.estimate?.clientEntityId || ''
          }
        />

        {/* Retailer Entity - Using EntitySelector */}
        <EntitySelector
          label="Retailer"
          placeholder="Select retailer..."
          fieldName="retailerEntityId"
          entityType="RETAILER"
          entities={props.entities}
          selectedEntity={selectedRetailerEntity}
          onEntitySelect={setSelectedRetailerEntity}
          onEntityUpdate={async (entity) => {
            const fields: (keyof Entity)[] = [
              'name',
              'addressLine1',
              'addressLine2',
              'city',
              'state',
              'postalCode',
            ]
            const updateInput = fields.reduce((acc, field) => {
              if (entity[field] !== undefined) {
                acc[field] = entity[field]
              }
              return acc
            }, {} as any)
            await updateEntity({
              variables: {
                id: entity.id,
                input: updateInput,
              },
            })
            setSelectedRetailerEntity(entity)
          }}
          hiddenInputValue={
            selectedRetailerEntity?.id || props.estimate?.retailerEntityId || ''
          }
        />

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

        {/* Billable Items Section */}
        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-medium">Billable Items</legend>

          {(createBillableItemError || updateBillableItemError) && (
            <div className="text-sm text-red-600">
              {createBillableItemError?.message ||
                updateBillableItemError?.message}
            </div>
          )}

          {billableItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No items yet. Add your first line item.
            </div>
          ) : (
            <div className="space-y-2">
              {billableItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center rounded-md border px-3 py-2"
                >
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">
                      Quantity
                    </div>
                    <div className="font-medium">{item.quantity}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Unit</div>
                    <div>
                      {item.unit?.shortName ||
                        item.unit?.fullName ||
                        item.unitId}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs text-muted-foreground">
                      Service / Action
                    </div>
                    <div>{serviceLabel(item)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Notes</div>
                    <div className="truncate">{item.notes || '—'}</div>
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="text-xs text-muted-foreground">
                      Unit Price
                    </div>
                    <div>${formatMoney(item.unitPrice as number)}</div>
                  </div>
                  <div className="col-span-1 text-right font-semibold">
                    <div className="text-xs text-muted-foreground">
                      Subtotal
                    </div>
                    <div>${formatMoney(item.subtotal as number)}</div>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Move up"
                      disabled={idx === 0}
                      onClick={() => handleReorder(idx, idx - 1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Move down"
                      disabled={idx === billableItems.length - 1}
                      onClick={() => handleReorder(idx, idx + 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Edit"
                      onClick={() => setEditingBillableItem(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Remove"
                      onClick={() => handleDeleteBillableItem(item.id)}
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
              Items subtotal: ${formatMoney(itemsTotal)}
            </div>
            <Dialog
              open={openNewBillableItem}
              onOpenChange={setOpenNewBillableItem}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isPersistedEstimate}
                >
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add Billable Item</DialogTitle>
                </DialogHeader>
                {isPersistedEstimate ? (
                  <BillableItemFormWrapper
                    onSave={handleCreateBillableItem}
                    loading={createBillableItemLoading}
                    error={createBillableItemError}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Save the estimate before adding items.
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </fieldset>

        <Dialog
          open={Boolean(editingBillableItem)}
          onOpenChange={(open) => !open && setEditingBillableItem(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Billable Item</DialogTitle>
            </DialogHeader>
            {editingBillableItem && (
              <BillableItemFormWrapper
                billableItem={editingBillableItem as BillableItem}
                onSave={(input, id) => handleUpdateBillableItem(input, id)}
                loading={updateBillableItemLoading}
                error={updateBillableItemError}
              />
            )}
          </DialogContent>
        </Dialog>

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
