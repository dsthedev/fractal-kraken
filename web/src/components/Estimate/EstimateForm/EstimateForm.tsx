import { useEffect, useMemo, useState, useCallback } from 'react'

import { gql } from '@apollo/client'
import { BookAlert, Pencil, Plus, Trash2Icon } from 'lucide-react'
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
  FindRates,
} from 'types/graphql'
import { v4 as uuidv4 } from 'uuid'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  TextAreaField,
  NumberField,
  Submit,
} from '@cedarjs/forms'
import { Link, routes } from '@cedarjs/router'
import type { TypedDocumentNode } from '@cedarjs/web'
import { useMutation, useQuery } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import BillableItemFormWrapper from 'src/components/BillableItem/BillableItemFormWrapper'
import SendEstimateEmail from 'src/components/SendEstimateEmail/SendEstimateEmail'
import { Alert, AlertTitle } from 'src/components/ui/alert'
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'src/components/ui/drawer'
import { Input } from 'src/components/ui/input'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from 'src/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from 'src/components/ui/toggle-group'
import {
  formatMoney,
  serviceLabel,
  buildRateLabel,
  buildRateSearchValue,
  buildEntityUpdateInput,
} from 'src/lib/estimateUtils'
import { currencyDisplay } from 'src/lib/formatters.js'
import { cn, getWeekNumber, buildTitle } from 'src/lib/utils'

import { EntitySelector } from './EntitySelector'

type FormEstimate = NonNullable<EditEstimateById['estimate']>

interface EstimateFormProps {
  estimate?: EditEstimateById['estimate']
  onSave: (data: UpdateEstimateInput, id?: FormEstimate['id']) => void
  onSaveAndExit?: (data: UpdateEstimateInput, id?: FormEstimate['id']) => void
  error: RWGqlError
  loading: boolean
  entities?: Entity[]
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
      actionId
      materialId
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
      action {
        id
        name
      }
      material {
        id
        name
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
      actionId
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
      action {
        id
        name
      }
      material {
        id
        name
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

const GET_RATES_QUERY: TypedDocumentNode<FindRates> = gql`
  query GetRatesForQuickAdd {
    rates {
      id
      actionId
      materialId
      unitId
      subAmount
      retailAmount
      currency
      context
      estimatedMinutesPerUnit
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
        id
        shortName
        fullName
      }
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
    <div className="flex-1 space-y-2">
      <Label
        name="title"
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        Title
      </Label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="title"
          type="text"
          value={titleValue}
          placeholder="Week # - Retailer - Customer"
          onChange={(e) => onTitleChange(e.target.value)}
          className="rw-input flex-1 w-full"
        />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="w-full sm:w-auto justify-start sm:justify-center p-0 sm:px-3 sm:py-2"
          onClick={() => {
            const retailerDisplay =
              selectedRetailerEntity?.nickname || selectedRetailerEntity?.name
            const clientDisplay =
              selectedClientEntity?.nickname || selectedClientEntity?.name
            console.log(retailerDisplay)
            const newTitle = buildTitle(
              weekNumber,
              retailerDisplay,
              clientDisplay
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
  const { data: ratesData, loading: ratesLoading } =
    useQuery<FindRates>(GET_RATES_QUERY)
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
    onError: (error) => toast.error(error.message),
  })

  const [deleteBillableItem] = useMutation(DELETE_BILLABLE_ITEM_MUTATION, {
    onError: (error) => toast.error(error.message),
  })

  const [openStatus, setOpenStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateEstimateInput['status']
  >(props.estimate?.status || 'DRAFT')
  const [pricingType, setPricingType] = useState<'sub' | 'retail'>('retail')
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
        props.estimate?.retailerEntity?.nickname,
        props.estimate?.clientEntity?.name
      ) + ' - New Estimate'
  )

  // Job address state
  const [jobAddressLine1, setJobAddressLine1] = useState(
    props.estimate?.jobAddressLine1 || ''
  )
  const [jobAddressLine2, setJobAddressLine2] = useState(
    props.estimate?.jobAddressLine2 || ''
  )
  const [jobCity, setJobCity] = useState(props.estimate?.jobCity || '')
  const [jobState, setJobState] = useState(props.estimate?.jobState || '')
  const [jobPostalCode, setJobPostalCode] = useState(
    props.estimate?.jobPostalCode || ''
  )

  const [openNewBillableItem, setOpenNewBillableItem] = useState(false)
  const [editingBillableItem, setEditingBillableItem] =
    useState<BillableItem | null>(null)
  const [billableItems, setBillableItems] = useState<BillableItem[]>([])
  // Quick-add temporarily disabled while billable item action/material integration is tested
  const [isDesktop, setIsDesktop] = useState(false)

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [billableItemToDelete, setBillableItemToDelete] = useState<
    number | null
  >(null)

  const openDeleteConfirm = (id: number) => {
    setBillableItemToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const closeDeleteConfirm = () => {
    setBillableItemToDelete(null)
    setDeleteConfirmOpen(false)
  }

  // Memoized derived values
  const weekNumber = useMemo(() => getWeekNumber(new Date()), [])
  const hasEntityDefaults = useMemo(
    () =>
      Boolean(
        currentUser?.defaultEntityId || currentUser?.defaultRetailerEntityId
      ),
    [currentUser?.defaultEntityId, currentUser?.defaultRetailerEntityId]
  )
  const isPersistedEstimate = useMemo(
    () => Boolean(props.estimate?.id),
    [props.estimate?.id]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Set default entities from current user if fields are empty
  useEffect(() => {
    if (!props.estimate?.installerEntityId && currentUser?.defaultEntityId) {
      const defaultEntity = props.entities?.find(
        (e) => e.id === currentUser.defaultEntityId
      )
      if (defaultEntity) {
        setSelectedInstallerEntity(defaultEntity)
      }
    }

    if (
      !props.estimate?.retailerEntityId &&
      currentUser?.defaultRetailerEntityId
    ) {
      const defaultRetailer = props.entities?.find(
        (e) => e.id === currentUser.defaultRetailerEntityId
      )
      if (defaultRetailer) {
        setSelectedRetailerEntity(defaultRetailer)
      }
    }
  }, [
    props.estimate?.installerEntityId,
    props.estimate?.retailerEntityId,
    currentUser?.defaultEntityId,
    currentUser?.defaultRetailerEntityId,
    props.entities,
  ])

  // Auto-populate job address from client if fields are empty
  useEffect(() => {
    if (selectedClientEntity) {
      if (!jobAddressLine1 && selectedClientEntity.addressLine1) {
        setJobAddressLine1(selectedClientEntity.addressLine1)
      }
      if (!jobAddressLine2 && selectedClientEntity.addressLine2) {
        setJobAddressLine2(selectedClientEntity.addressLine2)
      }
      if (!jobCity && selectedClientEntity.city) {
        setJobCity(selectedClientEntity.city)
      }
      if (!jobState && selectedClientEntity.state) {
        setJobState(selectedClientEntity.state)
      }
      if (!jobPostalCode && selectedClientEntity.postalCode) {
        setJobPostalCode(selectedClientEntity.postalCode)
      }
    }
  }, [
    selectedClientEntity,
    jobAddressLine1,
    jobAddressLine2,
    jobCity,
    jobState,
    jobPostalCode,
  ])

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

  const applyDefaultEntities = () => {
    if (currentUser?.defaultEntityId) {
      const defaultInstaller = props.entities?.find(
        (entity) => entity.id === currentUser.defaultEntityId
      )
      if (defaultInstaller) {
        setSelectedInstallerEntity(defaultInstaller)
      }
    }

    if (currentUser?.defaultRetailerEntityId) {
      const defaultRetailer = props.entities?.find(
        (entity) => entity.id === currentUser.defaultRetailerEntityId
      )
      if (defaultRetailer) {
        setSelectedRetailerEntity(defaultRetailer)
      }
    }
  }

  // Quick-add state
  const [selectedQuickAddRate, setSelectedQuickAddRate] = useState<
    FindRates['rates'][0] | null
  >(null)
  const [quickAddQuantity, setQuickAddQuantity] = useState<number>(1)
  const [openQuickAddCombobox, setOpenQuickAddCombobox] = useState(false)

  // Reusable entity update handler to avoid duplication
  const handleEntityUpdate = useCallback(
    async (entity: Partial<Entity>, setter: (e: Partial<Entity>) => void) => {
      const updateInput = buildEntityUpdateInput(entity)
      await updateEntity({
        variables: {
          id: entity.id as number,
          input: updateInput,
        },
      })
      setter(entity)
    },
    [updateEntity]
  )

  const handleQuickAddFromRate = async (
    rate: FindRates['rates'][0] | null | undefined
  ) => {
    if (!rate) return
    if (!props.estimate?.id) {
      toast.error('Save the estimate before adding items')
      return
    }

    const unitPrice = pricingType === 'sub' ? rate.subAmount : rate.retailAmount
    const input: Omit<
      CreateBillableItemInput,
      'authorId' | 'estimateId' | 'sortOrder'
    > = {
      actionId: rate.actionId ?? undefined,
      materialId: rate.materialId ?? undefined,
      unitId: rate.unitId ?? undefined,
      unitPrice: Number(unitPrice) as any,
      pricingType: pricingType === 'sub' ? 'SUB' : 'RETAIL',
      quantity: quickAddQuantity,
      subtotal: Number(unitPrice) * quickAddQuantity,
      estimatedMinutesPerUnit: rate.estimatedMinutesPerUnit ?? undefined,
      notes:
        rate.context ??
        rate.action?.description ??
        rate.material?.description ??
        undefined,
    }

    await handleCreateBillableItem(input)
    // reset selection
    setSelectedQuickAddRate(null)
    setQuickAddQuantity(1)
    setOpenQuickAddCombobox(false)
  }

  const handleCreateBillableItem = async (
    input: Omit<
      CreateBillableItemInput,
      'authorId' | 'estimateId' | 'sortOrder'
    >
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
          authorId:
            currentUser?.id || (props.estimate?.authorId as unknown as string),
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
      toast.success('Line item updated')
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
    toast.success('Line item updated')
  }

  const recalculateAll = async () => {
    if (billableItems.length === 0) {
      toast.success('No billable items to recalculate')
      return
    }

    try {
      const updatedItems: any[] = []
      for (const item of billableItems) {
        const qty = Number(item.quantity ?? 0)
        const price = Number(item.unitPrice ?? 0)
        const newSubtotal = Number((qty * price).toFixed(2))

        if (!item.id) continue

        if (Number(item.subtotal ?? 0) !== newSubtotal) {
          const { data } = await updateBillableItem({
            variables: { id: item.id, input: { subtotal: newSubtotal } },
          })
          if (data?.updateBillableItem) {
            updatedItems.push(data.updateBillableItem)
          }
        }
      }

      if (updatedItems.length > 0) {
        setBillableItems((prev) =>
          prev.map((it) => {
            const updated = updatedItems.find((u) => u.id === it.id)
            return updated ? { ...it, ...updated } : it
          })
        )
        toast.success(`Recalculated ${updatedItems.length} item(s)`)
      } else {
        toast.success('All subtotals already up to date')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to recalculate items')
    }
  }

  // Build submit data (used by both onSubmit and Save & Exit)
  const buildSubmitData = useCallback(
    (data?: Partial<FormEstimate>): UpdateEstimateInput => ({
      ...data,
      title: titleValue,
      jobAddressLine1,
      jobAddressLine2,
      jobCity,
      jobState,
      jobPostalCode,
      uuid: data?.uuid || props.estimate?.uuid || uuidv4(),
      status: selectedStatus,
      installerEntityId: selectedInstallerEntity?.id,
      clientEntityId: selectedClientEntity?.id,
      retailerEntityId: selectedRetailerEntity?.id,
      authorId: currentUser?.id || props.estimate?.authorId,
      jobCountry: 'United States',
      subtotal: itemsTotal,
      total: itemsTotal,
    }),
    [
      titleValue,
      jobAddressLine1,
      jobAddressLine2,
      jobCity,
      jobState,
      jobPostalCode,
      props.estimate?.uuid,
      props.estimate?.authorId,
      selectedStatus,
      selectedInstallerEntity?.id,
      selectedClientEntity?.id,
      selectedRetailerEntity?.id,
      currentUser?.id,
      itemsTotal,
    ]
  )

  const onSubmit = (data: FormEstimate) => {
    const submitData = buildSubmitData(data)
    props.onSave(submitData, props?.estimate?.id)
  }

  return (
    <>
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-4 border-b border-border">
            <TitleSection
              titleValue={titleValue}
              onTitleChange={setTitleValue}
              weekNumber={weekNumber}
              selectedRetailerEntity={selectedRetailerEntity}
              selectedClientEntity={selectedClientEntity}
            />

            <div className="w-full sm:w-48 sm:ml-auto">
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
                            'UNDERWAY',
                            'INVOICED',
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

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <fieldset
              key={selectedClientEntity?.id || 'no-client'}
              className="space-y-2 md:w-1/2 order-2"
            >
              <legend className="text-sm font-medium flex items-center justify-between">
                <span>Job Location</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    setJobAddressLine1(selectedClientEntity?.addressLine1 || '')
                    setJobAddressLine2(selectedClientEntity?.addressLine2 || '')
                    setJobCity(selectedClientEntity?.city || '')
                    setJobState(selectedClientEntity?.state || '')
                    setJobPostalCode(selectedClientEntity?.postalCode || '')
                  }}
                  disabled={!selectedClientEntity?.id}
                  title="Copy address from client"
                >
                  Copy from Client
                </Button>
              </legend>

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
                  value={jobAddressLine1}
                  onChange={(e) => setJobAddressLine1(e.target.value)}
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
                  value={jobAddressLine2}
                  onChange={(e) => setJobAddressLine2(e.target.value)}
                  className="rw-input"
                  errorClassName="rw-input rw-input-error"
                />

                <FieldError name="jobAddressLine2" className="rw-field-error" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <div className="col-span-1 sm:col-span-3">
                  <Label
                    name="jobCity"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    City
                  </Label>

                  <TextField
                    name="jobCity"
                    value={jobCity}
                    onChange={(e) => setJobCity(e.target.value)}
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
                    value={jobState}
                    onChange={(e) => setJobState(e.target.value)}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                  />

                  <FieldError name="jobState" className="rw-field-error" />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <Label
                    name="jobPostalCode"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Postal Code
                  </Label>

                  <TextField
                    name="jobPostalCode"
                    value={jobPostalCode}
                    onChange={(e) => setJobPostalCode(e.target.value)}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                  />

                  <FieldError name="jobPostalCode" className="rw-field-error" />
                </div>
              </div>

              {/* Hidden country defaults to United States */}
              <input type="hidden" name="jobCountry" value="United States" />
            </fieldset>

            <fieldset className="space-y-3 md:w-1/2 order-1">
              <legend>
                <span className="text-sm font-medium">Entities</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-4"
                  onClick={applyDefaultEntities}
                  disabled={!hasEntityDefaults}
                >
                  Use Defaults
                </Button>
              </legend>

              <div className="w-full">
                <EntitySelector
                  label="Installer"
                  placeholder="Select installer..."
                  fieldName="installerEntityId"
                  entityType="INSTALLER"
                  entities={props.entities}
                  selectedEntity={selectedInstallerEntity}
                  onEntitySelect={setSelectedInstallerEntity}
                  onEntityUpdate={(entity) =>
                    handleEntityUpdate(entity, setSelectedInstallerEntity)
                  }
                  hiddenInputValue={
                    selectedInstallerEntity?.id ||
                    props.estimate?.installerEntityId ||
                    ''
                  }
                />
              </div>

              <div className="w-full">
                <EntitySelector
                  label="Client"
                  placeholder="Select client..."
                  fieldName="clientEntityId"
                  entityType="CLIENT"
                  entities={props.entities}
                  selectedEntity={selectedClientEntity}
                  onEntitySelect={setSelectedClientEntity}
                  onEntityUpdate={(entity) =>
                    handleEntityUpdate(entity, setSelectedClientEntity)
                  }
                  hiddenInputValue={
                    selectedClientEntity?.id ||
                    props.estimate?.clientEntityId ||
                    ''
                  }
                />
              </div>

              <div className="w-full">
                <EntitySelector
                  label="Retailer"
                  placeholder="Select retailer..."
                  fieldName="retailerEntityId"
                  entityType="RETAILER"
                  entities={props.entities}
                  selectedEntity={selectedRetailerEntity}
                  onEntitySelect={setSelectedRetailerEntity}
                  onEntityUpdate={(entity) =>
                    handleEntityUpdate(entity, setSelectedRetailerEntity)
                  }
                  hiddenInputValue={
                    selectedRetailerEntity?.id ||
                    props.estimate?.retailerEntityId ||
                    ''
                  }
                />
              </div>
            </fieldset>
          </div>

          {/* Billable Items Section */}
          <fieldset className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-medium flex items-center gap-2">
                Billable Items
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={recalculateAll}
                  title="Recalculate all subtotals"
                >
                  Recalculate
                </Button>
              </legend>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Default Rate:
                </span>
                <ToggleGroup
                  type="single"
                  value={pricingType}
                  onValueChange={(v) => setPricingType(v as 'sub' | 'retail')}
                  className="p-1"
                >
                  <ToggleGroupItem value="retail" className="text-xs">
                    Retailer
                  </ToggleGroupItem>
                  <ToggleGroupItem value="sub" className="text-xs">
                    Subcontractor
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

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
                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {billableItems.map((item, _idx) => (
                    <div
                      key={item.id}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.quantity} ×{' '}
                            {item.unit?.shortName ||
                              item.unit?.fullName ||
                              item.unitId}{' '}
                            - {serviceLabel(item)}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Unit Price
                          </div>
                          <div>${formatMoney(item.unitPrice as number)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Subtotal
                          </div>
                          <div className="font-semibold">
                            ${formatMoney(item.subtotal as number)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          title="Edit"
                          onClick={() => setEditingBillableItem(item)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          title="Remove"
                          onClick={() => openDeleteConfirm(item.id)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="space-y-2">
                    {billableItems.map((item, _idx) => (
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
                          <div className="text-xs text-muted-foreground">
                            Unit
                          </div>
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
                          <div className="text-xs text-muted-foreground">
                            Notes
                          </div>
                          <div className="truncate">{item.notes || '—'}</div>
                        </div>
                        <div className="col-span-1 text-right">
                          <div className="text-xs text-muted-foreground">
                            Unit Price
                          </div>
                          <div>${formatMoney(item.unitPrice as number)}</div>
                        </div>
                        <div className="col-span-1 text-right font-semibold pr-4">
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
                            onClick={() => openDeleteConfirm(item.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
              <div className="flex flex-col gap-4 w-full">
                {/* Quick add controls */}
                <div className="flex flex-1 flex-col md:flex-row items-end gap-4 justify-between">
                  <div className="flex flex-row items-end">
                    {/* Quantity */}
                    <div className="flex-0 gap-2 mr-2">
                      <label
                        htmlFor="quickAddQuantity"
                        className="text-xs text-muted-foreground whitespace-nowrap"
                      >
                        Qty
                      </label>
                      <Input
                        id="quickAddQuantity"
                        type="number"
                        min="1"
                        value={quickAddQuantity}
                        onChange={(e) =>
                          setQuickAddQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className=" w-20"
                        disabled={!isPersistedEstimate}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>

                    {/* Rate combobox */}
                    <div className="flex-1">
                      <Popover
                        open={openQuickAddCombobox}
                        onOpenChange={setOpenQuickAddCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openQuickAddCombobox}
                            className={cn(
                              'w-full',
                              !selectedQuickAddRate && 'text-muted-foreground'
                            )}
                            disabled={!isPersistedEstimate || ratesLoading}
                          >
                            {selectedQuickAddRate
                              ? buildRateLabel(
                                  selectedQuickAddRate,
                                  pricingType
                                )
                              : 'Select from Rates...'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-fit">
                          <Command>
                            <CommandInput placeholder="Search rates..." />
                            <CommandEmpty>No rates found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {ratesData?.rates
                                  ?.slice()
                                  .sort((a, b) => {
                                    const aAction = a.action?.name || ''
                                    const bAction = b.action?.name || ''
                                    const actionCompare =
                                      aAction.localeCompare(bAction)
                                    if (actionCompare !== 0)
                                      return actionCompare
                                    const aMaterial = a.material?.name || ''
                                    const bMaterial = b.material?.name || ''
                                    return aMaterial.localeCompare(bMaterial)
                                  })
                                  .map((rate) => (
                                    <CommandItem
                                      key={rate.id}
                                      value={buildRateSearchValue(rate)}
                                      onSelect={() => {
                                        setSelectedQuickAddRate(rate)
                                        setOpenQuickAddCombobox(false)
                                      }}
                                    >
                                      {buildRateLabel(rate, pricingType)}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Add selected rate */}
                  <div className="flex">
                    <Button
                      type="button"
                      variant="lime"
                      size="xl"
                      className="w-full md:w-auto md:flex-shrink-0"
                      onClick={() =>
                        handleQuickAddFromRate(selectedQuickAddRate)
                      }
                      disabled={!isPersistedEstimate || !selectedQuickAddRate}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add from Rate
                    </Button>
                  </div>
                </div>

                {/* Persisted estimate warning */}
                {!isPersistedEstimate && (
                  <Alert>
                    <BookAlert />
                    <AlertTitle>
                      <strong>Note:</strong> Estimates must be saved before
                      adding billable items
                    </AlertTitle>
                  </Alert>
                )}

                {/* Add a custom item */}
                <div className="flex flex-col md:flex-row gap-2 my-2">
                  {isDesktop ? (
                    <Dialog
                      open={openNewBillableItem}
                      onOpenChange={setOpenNewBillableItem}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="w-full md:w-auto"
                          disabled={!isPersistedEstimate}
                        >
                          Add Custom Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-full sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Add Billable Item</DialogTitle>
                        </DialogHeader>
                        {isPersistedEstimate && (
                          <BillableItemFormWrapper
                            onSave={handleCreateBillableItem}
                            loading={createBillableItemLoading}
                            error={createBillableItemError}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Drawer
                      open={openNewBillableItem}
                      onOpenChange={setOpenNewBillableItem}
                    >
                      <DrawerTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="w-full"
                          disabled={!isPersistedEstimate}
                        >
                          Add Custom Item
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Add Billable Item</DrawerTitle>
                        </DrawerHeader>
                        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-4 pb-6">
                          {isPersistedEstimate && (
                            <BillableItemFormWrapper
                              onSave={handleCreateBillableItem}
                              loading={createBillableItemLoading}
                              error={createBillableItemError}
                            />
                          )}
                        </div>
                        <div className="px-4 pb-4">
                          <DrawerClose asChild>
                            <Button variant="outline" className="w-full">
                              Close
                            </Button>
                          </DrawerClose>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Author ID - Visually hidden, auto-populated from current user */}
          <input type="hidden" name="authorId" value={currentUser?.id || ''} />

          <input type="hidden" name="subtotal" value={itemsTotal} />

          <TextField
            name="taxTotal"
            defaultValue={props.estimate?.taxTotal || 0}
            className="hidden"
            errorClassName="hidden"
            validation={{ valueAsNumber: true, required: true }}
          />

          <div className="mt-6 rounded-md border bg-muted/30 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-3xl font-semibold">
              {currencyDisplay(itemsTotal)}
            </span>
          </div>

          {/* Hidden form field to persist numeric total */}
          <input type="hidden" name="total" value={itemsTotal} />

          <FieldError name="total" className="rw-field-error" />

          <NumberField
            name="estimatedMinutesTotal"
            defaultValue={props.estimate?.estimatedMinutesTotal || 0}
            className="hidden"
            errorClassName="hidden"
          />

          <details className="mt-4 border rounded-md">
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
              Notes
            </summary>
            <div className="px-3 pb-3 pt-1 space-y-2">
              <TextAreaField
                name="notes"
                defaultValue={props.estimate?.notes}
                className="rw-input"
                errorClassName="rw-input rw-input-error"
                rows={8}
              />

              <FieldError name="notes" className="rw-field-error" />
            </div>
          </details>

          <NumberField
            name="entityId"
            defaultValue={props.estimate?.entityId || undefined}
            className="hidden"
            errorClassName="hidden"
            emptyAs={'undefined'}
          />

          <div className="rw-button-group flex gap-2">
            {props.estimate?.id && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={routes.estimate({ id: props.estimate.id })}>
                  View / Print
                </Link>
              </Button>
            )}
            <Button asChild variant="lime">
              <Submit disabled={props.loading}>Save</Submit>
            </Button>
            <Button
              disabled={props.loading}
              variant="sky"
              onClick={() => {
                const submitData = buildSubmitData()
                props.onSaveAndExit?.(submitData, props?.estimate?.id)
              }}
            >
              Save & Exit
            </Button>
          </div>
        </Form>
      </div>

      {/* Send Estimate via Email Section */}
      {props.estimate?.id && (
        <div className="px-8 py-4 border-t">
          <SendEstimateEmail
            estimateId={props.estimate.id}
            entities={
              [
                props.estimate.installerEntity,
                props.estimate.retailerEntity,
                props.estimate.clientEntity,
              ].filter(Boolean) as Entity[]
            }
          />
        </div>
      )}

      {/* Edit Billable Item Dialog/Drawer moved outside the parent form to avoid nested form submission */}
      {isDesktop ? (
        <Dialog
          open={Boolean(editingBillableItem)}
          onOpenChange={(open) => !open && setEditingBillableItem(null)}
        >
          <DialogContent className="max-w-full sm:max-w-3xl">
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
      ) : (
        <Drawer
          open={Boolean(editingBillableItem)}
          onOpenChange={(open) => !open && setEditingBillableItem(null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Billable Item</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-4 pb-6">
              {editingBillableItem && (
                <BillableItemFormWrapper
                  billableItem={editingBillableItem as BillableItem}
                  onSave={(input, id) => handleUpdateBillableItem(input, id)}
                  loading={updateBillableItemLoading}
                  error={updateBillableItemError}
                />
              )}
            </div>
            <div className="px-4 pb-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      )}
      {/* Delete confirmation dialog for billable items */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) closeDeleteConfirm()
          else setDeleteConfirmOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete line item?</DialogTitle>
          </DialogHeader>
          <div className="px-3 pb-3 pt-1">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this billable item? This action
              cannot be undone if the estimate is saved afterwards.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={closeDeleteConfirm}>
                No
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (billableItemToDelete) {
                    await handleDeleteBillableItem(billableItemToDelete)
                  }
                  closeDeleteConfirm()
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EstimateForm
