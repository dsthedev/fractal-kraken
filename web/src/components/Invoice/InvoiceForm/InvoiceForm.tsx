import { useMemo, useState, useEffect } from 'react'

import { useController } from 'react-hook-form'
import type {
  EditInvoiceByUuid,
  UpdateInvoiceInput,
  Entity,
} from 'types/graphql'
import { v4 as uuidv4 } from 'uuid'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  Label,
  FieldError,
  TextField,
  NumberField,
  Submit,
  useFormContext,
} from '@cedarjs/forms'
import { Link, routes } from '@cedarjs/router'
import type { TypedDocumentNode } from '@cedarjs/web'
import { useQuery } from '@cedarjs/web'

import { useAuth } from 'src/auth'
import { EntitySelector } from 'src/components/Estimate/EstimateForm/EntitySelector'
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'src/components/ui/dialog'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from 'src/components/ui/popover'
import { cn, getWeekNumber, buildTitle } from 'src/lib/utils'

type FormInvoice = NonNullable<EditInvoiceByUuid['invoice']>

interface InvoiceFormProps {
  invoice?: EditInvoiceByUuid['invoice']
  onSave: (data: UpdateInvoiceInput, uuid?: FormInvoice['uuid']) => void
  error: RWGqlError
  loading: boolean
  entities?: Entity[]
}

const FIND_ENTITIES_QUERY: TypedDocumentNode<{ entities: Entity[] }> = gql`
  query FindEntitiesForInvoiceForm {
    entities {
      id
      type
      name
      nickname
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      contactName
      email
      phone
      createdAt
      updatedAt
    }
  }
`

// Custom controlled status selector component
const StatusDropdown = () => {
  const { control } = useFormContext()
  const { field } = useController({
    name: 'status',
    control,
    rules: { required: 'Status is required' },
  })
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between w-full',
            !field.value && 'text-muted-foreground'
          )}
        >
          {field.value || 'Draft'}
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
              {['DRAFT', 'SENT', 'ARCHIVED'].map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={(value) => {
                    field.onChange(value.toUpperCase())
                    setOpen(false)
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
  )
}

// Custom controlled payment status selector component
const PayStatusDropdown = () => {
  const { control, watch } = useFormContext()
  const status = watch('status')
  const { field } = useController({
    name: 'payStatus',
    control,
    rules: {
      required: status !== 'DRAFT' ? 'Payment status is required' : false,
    },
  })
  const [open, setOpen] = useState(false)

  // Only show if status is not DRAFT
  if (status === 'DRAFT') {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between w-full',
            !field.value && 'text-muted-foreground'
          )}
        >
          {field.value || 'Unpaid'}
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
          <CommandInput placeholder="Search payment status..." />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {['UNPAID', 'OUTSTANDING', 'PAID'].map((payStatus) => (
                <CommandItem
                  key={payStatus}
                  value={payStatus}
                  onSelect={(value) => {
                    field.onChange(value.toUpperCase())
                    setOpen(false)
                  }}
                >
                  {payStatus}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Wrapper for EntitySelector to work with React Hook Form
interface EntitySelectorFieldProps {
  name: string
  label: string
  entityType: 'CONTRACTOR' | 'CLIENT' | 'RETAILER' | 'INSTALLER'
  entities: Entity[]
  placeholder: string
  required?: boolean
}

const EntitySelectorField = (props: EntitySelectorFieldProps) => {
  const { control, watch } = useFormContext()
  const { field } = useController({
    name: props.name,
    control,
    rules: { required: props.required ? `${props.label} is required` : false },
  })
  const value = watch(props.name)
  const selectedEntity = value
    ? props.entities?.find((e) => e.id === value)
    : undefined

  return (
    <EntitySelector
      label={props.label}
      placeholder={props.placeholder}
      fieldName={props.name}
      entityType={props.entityType}
      entities={props.entities}
      selectedEntity={selectedEntity}
      onEntitySelect={(entity) => {
        field.onChange(entity?.id || undefined)
      }}
      onEntityCreate={(entity) => {
        field.onChange(entity.id)
      }}
      hiddenInputValue={value || ''}
    />
  )
}

// Wrapper components that use form context - defined here so they can be used in InvoiceForm's JSX
const GenerateInvoiceNumberButtonContent = ({
  weekNumber,
}: {
  weekNumber: string
}) => {
  const { setValue } = useFormContext()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        const newNumber = buildTitle(weekNumber, '', '')
        setValue('invoiceNumber', newNumber)
      }}
    >
      Generate
    </Button>
  )
}

const CopyAddressButtonContent = ({
  open,
  onOpenChange,
  entityId,
  entities,
  addressFieldPrefix,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityId?: number
  entities: Entity[]
  addressFieldPrefix: 'payor' | 'payee'
  title: string
  description: string
}) => {
  const { setValue } = useFormContext()

  if (!entityId) {
    return null
  }

  const selectedEntity = entities?.find((e) => e.id === entityId)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(true)}
      >
        Use {addressFieldPrefix === 'payor' ? 'Payor' : 'Payee'} Info
      </Button>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex gap-4 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedEntity) {
                    setValue(
                      `${addressFieldPrefix}AddressLine1` as any,
                      selectedEntity.addressLine1 || ''
                    )
                    setValue(
                      `${addressFieldPrefix}AddressLine2` as any,
                      selectedEntity.addressLine2 || ''
                    )
                    setValue(
                      `${addressFieldPrefix}City` as any,
                      selectedEntity.city || ''
                    )
                    setValue(
                      `${addressFieldPrefix}State` as any,
                      selectedEntity.state || ''
                    )
                    setValue(
                      `${addressFieldPrefix}PostalCode` as any,
                      selectedEntity.postalCode || ''
                    )
                  }
                  onOpenChange(false)
                }}
              >
                Fill Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

const PaidAtFieldContent = () => {
  const { watch } = useFormContext()
  const payStatus = watch('payStatus')

  return (
    <>
      <Label
        name="paidAt"
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        Paid At
      </Label>
      <input
        type="datetime-local"
        name="paidAt"
        disabled={payStatus !== 'PAID'}
        className="rw-input disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <FieldError name="paidAt" className="rw-field-error" />
    </>
  )
}

const PayStatusSectionContent = () => {
  const { watch } = useFormContext()
  const status = watch('status')

  if (status === 'DRAFT') {
    return null
  }

  return (
    <div className="w-full sm:w-48">
      <Label
        name="payStatus"
        className="rw-label"
        errorClassName="rw-label rw-label-error"
      >
        Payment Status
      </Label>
      <PayStatusDropdown />
      <FieldError name="payStatus" className="rw-field-error" />
    </div>
  )
}

// Auto-populate name and address fields from entity selection
// Copy payor address to job location
const SameAsPayorButton = () => {
  const { watch, setValue } = useFormContext()

  const handleCopyPayorToJob = () => {
    const payorName = watch('payorName')
    const payorAddressLine1 = watch('payorAddressLine1')
    const payorAddressLine2 = watch('payorAddressLine2')
    const payorCity = watch('payorCity')
    const payorState = watch('payorState')
    const payorPostalCode = watch('payorPostalCode')
    const payorCountry = watch('payorCountry')

    setValue('jobName', payorName)
    setValue('jobAddressLine1', payorAddressLine1)
    setValue('jobAddressLine2', payorAddressLine2)
    setValue('jobCity', payorCity)
    setValue('jobState', payorState)
    setValue('jobPostalCode', payorPostalCode)
    setValue('jobCountry', payorCountry)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopyPayorToJob}
    >
      Same as Payor
    </Button>
  )
}

const AutoPopulateEntityFields = ({ entities }: { entities: Entity[] }) => {
  const { watch, setValue } = useFormContext()

  // Watch entity IDs and field values
  const payorEntityId = watch('payorEntityId')
  const payeeEntityId = watch('payeeEntityId')
  const payorName = watch('payorName')
  const payeeName = watch('payeeName')
  const payorAddressLine1 = watch('payorAddressLine1')
  const payeeAddressLine1 = watch('payeeAddressLine1')

  // Auto-populate payor info when payor entity changes
  useEffect(() => {
    if (payorEntityId) {
      const entity = entities.find((e) => e.id === payorEntityId)
      if (entity) {
        // Only populate name if empty
        if (!payorName || payorName === '') {
          const name = entity.nickname || entity.name
          setValue('payorName', name)
        }
        // Only populate address if address line 1 is empty
        if (!payorAddressLine1 || payorAddressLine1 === '') {
          setValue('payorAddressLine1', entity.addressLine1 || '')
          setValue('payorAddressLine2', entity.addressLine2 || '')
          setValue('payorCity', entity.city || '')
          setValue('payorState', entity.state || '')
          setValue('payorPostalCode', entity.postalCode || '')
          setValue('payorCountry', entity.country || 'US')
        }
      }
    }
  }, [payorEntityId, entities, payorName, payorAddressLine1, setValue])

  // Auto-populate payee info when payee entity changes
  useEffect(() => {
    if (payeeEntityId) {
      const entity = entities.find((e) => e.id === payeeEntityId)
      if (entity) {
        // Only populate name if empty
        if (!payeeName || payeeName === '') {
          const name = entity.nickname || entity.name
          setValue('payeeName', name)
        }
        // Only populate address if address line 1 is empty
        if (!payeeAddressLine1 || payeeAddressLine1 === '') {
          setValue('payeeAddressLine1', entity.addressLine1 || '')
          setValue('payeeAddressLine2', entity.addressLine2 || '')
          setValue('payeeCity', entity.city || '')
          setValue('payeeState', entity.state || '')
          setValue('payeePostalCode', entity.postalCode || '')
          setValue('payeeCountry', entity.country || 'US')
        }
      }
    }
  }, [payeeEntityId, entities, payeeName, payeeAddressLine1, setValue])

  return null // This component doesn't render anything
}

const InvoiceForm = (props: InvoiceFormProps) => {
  const { currentUser } = useAuth()

  // Fetch entities from database
  const { data: entitiesData } = useQuery(FIND_ENTITIES_QUERY)
  const entities = entitiesData?.entities || props.entities || []

  // Filter entities by type (for invoices, include all types)
  const allowedEntityTypes = ['CONTRACTOR', 'CLIENT', 'RETAILER', 'INSTALLER']
  const filteredEntities =
    entities?.filter((e) => allowedEntityTypes.includes(e.type)) || []

  // Generate UUID for new invoices
  const invoiceUuid = useMemo(
    () => props.invoice?.uuid || uuidv4(),
    [props.invoice?.uuid]
  )

  // State for dialog controls only (not form data)
  const [openSourceDialog, setOpenSourceDialog] = useState(false)
  const [openPayorCopyConfirm, setOpenPayorCopyConfirm] = useState(false)
  const [openPayeeCopyConfirm, setOpenPayeeCopyConfirm] = useState(false)

  // Generate invoice number default
  const weekNumber: string = useMemo(
    () => String(getWeekNumber(new Date())),
    []
  )
  const getDefaultInvoiceNumber = () =>
    props.invoice?.invoiceNumber || buildTitle(weekNumber, '', '')
  const getDefaultDueDate = () => {
    if (props.invoice?.dueAt) return props.invoice.dueAt
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  // Check if invoice has any source references
  const hasSourceReferences = useMemo(
    () =>
      Boolean(
        props.invoice?.sourceEstimateId ||
          props.invoice?.sourceInstallerEntityId ||
          props.invoice?.sourceClientEntityId ||
          props.invoice?.sourceRetailerEntityId
      ),
    [
      props.invoice?.sourceEstimateId,
      props.invoice?.sourceInstallerEntityId,
      props.invoice?.sourceClientEntityId,
      props.invoice?.sourceRetailerEntityId,
    ]
  )

  const onSubmit = (data: FormInvoice) => {
    const { uuid: _uuid, ...inputData } = data
    const uuidToUse = props.invoice?.uuid || invoiceUuid
    props.onSave(inputData as UpdateInvoiceInput, uuidToUse)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormInvoice>
        onSubmit={onSubmit}
        error={props.error}
        config={{
          defaultValues: {
            uuid: invoiceUuid,
            authorId: currentUser?.id || props.invoice?.authorId || '',
            invoiceNumber: getDefaultInvoiceNumber(),
            status: props.invoice?.status || 'DRAFT',
            payStatus: props.invoice?.payStatus || 'UNPAID',
            taxTotal: props.invoice?.taxTotal || 0,
            payorEntityId: props.invoice?.payorEntityId || undefined,
            payorName: props.invoice?.payorName || '',
            payorAddressLine1: props.invoice?.payorAddressLine1 || '',
            payorAddressLine2: props.invoice?.payorAddressLine2 || '',
            payorCity: props.invoice?.payorCity || '',
            payorState: props.invoice?.payorState || '',
            payorPostalCode: props.invoice?.payorPostalCode || '',
            payorCountry: 'US',
            payeeEntityId: props.invoice?.payeeEntityId || undefined,
            payeeName: props.invoice?.payeeName || '',
            payeeAddressLine1: props.invoice?.payeeAddressLine1 || '',
            payeeAddressLine2: props.invoice?.payeeAddressLine2 || '',
            payeeCity: props.invoice?.payeeCity || '',
            payeeState: props.invoice?.payeeState || '',
            payeePostalCode: props.invoice?.payeePostalCode || '',
            payeeCountry: 'US',
            jobStartedAt: props.invoice?.jobStartedAt || '',
            jobFinishedAt: props.invoice?.jobFinishedAt || '',
            dueAt: getDefaultDueDate(),
            paidAt: props.invoice?.paidAt || '',
            jobName: props.invoice?.jobName || '',
            jobAddressLine1: props.invoice?.jobAddressLine1 || '',
            jobAddressLine2: props.invoice?.jobAddressLine2 || '',
            jobCity: props.invoice?.jobCity || '',
            jobState: props.invoice?.jobState || '',
            jobPostalCode: props.invoice?.jobPostalCode || '',
            jobCountry: props.invoice?.jobCountry || 'US',
          },
        }}
      >
        <AutoPopulateEntityFields entities={entities} />
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Visually Hidden + ReadOnly System Fields */}

        {/* UUID - Auto-generated for new invoices, persisted for existing */}
        <TextField
          name="uuid"
          defaultValue={invoiceUuid}
          className="hidden"
          errorClassName="hidden"
          validation={{ required: true }}
          readOnly
        />

        {/* Author ID - Auto-populated from current user */}
        <TextField
          name="authorId"
          defaultValue={currentUser?.id || props.invoice?.authorId || ''}
          className="hidden"
          errorClassName="hidden"
          validation={{ required: true }}
          readOnly
        />

        {/* Tax Total - Hidden, defaults to 0 (future tax calculation feature) */}
        <NumberField
          name="taxTotal"
          defaultValue={props.invoice?.taxTotal || 0}
          className="hidden"
          errorClassName="hidden"
          validation={{ valueAsNumber: true, required: true }}
        />

        {/* Invoice Header Section */}
        <div className="flex flex-col gap-4 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Invoice Number with Generate Button */}
            <div className="flex-1 space-y-2">
              <Label
                name="invoiceNumber"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Invoice Number
              </Label>

              <div className="flex flex-col sm:flex-row gap-2">
                <TextField
                  name="invoiceNumber"
                  validation={{
                    required: 'Invoice number is required',
                  }}
                  placeholder="Week # - Retailer - Client"
                  className="rw-input flex-1 w-full"
                />
                <GenerateInvoiceNumberButtonContent weekNumber={weekNumber} />
              </div>

              <FieldError name="invoiceNumber" className="rw-field-error" />
            </div>

            {/* Status Selector */}
            <div className="w-full sm:w-48">
              <Label
                name="status"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Status
              </Label>
              <StatusDropdown />
              <FieldError name="status" className="rw-field-error" />
            </div>
          </div>

          {/* Payment Status - Only visible if status is not DRAFT */}
          <PayStatusSectionContent />

          {/* Source Reference Button - Only visible on edit form, disabled if no sources */}
          {props.invoice?.uuid && (
            <div className="mt-2">
              <Dialog
                open={openSourceDialog}
                onOpenChange={setOpenSourceDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasSourceReferences}
                  >
                    View Source
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Source Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Source Estimate */}
                    {props.invoice?.sourceEstimateId && (
                      <div>
                        <h3 className="font-semibold mb-2">Source Estimate</h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">ID: </span>
                            <Link
                              to={routes.estimate({
                                id: props.invoice.sourceEstimateId,
                              })}
                              className="text-blue-600 hover:underline"
                            >
                              {props.invoice.sourceEstimateId}
                            </Link>
                          </div>
                          {props.invoice.sourceEstimate?.title && (
                            <div>
                              <span className="text-muted-foreground">
                                Title:{' '}
                              </span>
                              {props.invoice.sourceEstimate.title}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Source Installer Entity */}
                    {props.invoice?.sourceInstallerEntity && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Source Installer Entity
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Name:{' '}
                            </span>
                            {props.invoice.sourceInstallerEntity.nickname ||
                              props.invoice.sourceInstallerEntity.name}
                          </div>
                          {props.invoice.sourceInstallerEntity.email && (
                            <div>
                              <span className="text-muted-foreground">
                                Email:{' '}
                              </span>
                              {props.invoice.sourceInstallerEntity.email}
                            </div>
                          )}
                          {props.invoice.sourceInstallerEntity.phone && (
                            <div>
                              <span className="text-muted-foreground">
                                Phone:{' '}
                              </span>
                              {props.invoice.sourceInstallerEntity.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Source Client Entity */}
                    {props.invoice?.sourceClientEntity && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Source Client Entity
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Name:{' '}
                            </span>
                            {props.invoice.sourceClientEntity.nickname ||
                              props.invoice.sourceClientEntity.name}
                          </div>
                          {props.invoice.sourceClientEntity.email && (
                            <div>
                              <span className="text-muted-foreground">
                                Email:{' '}
                              </span>
                              {props.invoice.sourceClientEntity.email}
                            </div>
                          )}
                          {props.invoice.sourceClientEntity.phone && (
                            <div>
                              <span className="text-muted-foreground">
                                Phone:{' '}
                              </span>
                              {props.invoice.sourceClientEntity.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Source Retailer Entity */}
                    {props.invoice?.sourceRetailerEntity && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Source Retailer Entity
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Name:{' '}
                            </span>
                            {props.invoice.sourceRetailerEntity.nickname ||
                              props.invoice.sourceRetailerEntity.name}
                          </div>
                          {props.invoice.sourceRetailerEntity.email && (
                            <div>
                              <span className="text-muted-foreground">
                                Email:{' '}
                              </span>
                              {props.invoice.sourceRetailerEntity.email}
                            </div>
                          )}
                          {props.invoice.sourceRetailerEntity.phone && (
                            <div>
                              <span className="text-muted-foreground">
                                Phone:{' '}
                              </span>
                              {props.invoice.sourceRetailerEntity.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* No source info message */}
                    {!props.invoice?.sourceEstimateId &&
                      !props.invoice?.sourceInstallerEntity &&
                      !props.invoice?.sourceClientEntity &&
                      !props.invoice?.sourceRetailerEntity && (
                        <p className="text-sm text-muted-foreground">
                          No source information available.
                        </p>
                      )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Billing Parties and Job Info Section - 2 column grid on medium+ */}
        <div className="mt-6 border-b border-border pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payor Entity */}
            <fieldset className="order-2 space-y-3 md:border md:border-border md:p-4 md:rounded">
              <legend className="text-sm font-semibold">
                Payor (Who is paying)
              </legend>

              <EntitySelectorField
                name="payorEntityId"
                label="Payor"
                entityType="CLIENT"
                entities={filteredEntities}
                placeholder="Select Payor..."
                required={true}
              />

              <div>
                <Label name="payorName" className="rw-label">
                  Payor Name
                </Label>
                <TextField
                  name="payorName"
                  validation={{ required: 'Payor name is required' }}
                  errorClassName="rw-input rw-input-error"
                  className="rw-input"
                />
                <FieldError name="payorName" className="rw-field-error" />
              </div>

              {/* Copy Address Button - shown if payor entity is selected */}
              <CopyAddressButtonContent
                open={openPayorCopyConfirm}
                onOpenChange={setOpenPayorCopyConfirm}
                entityId={undefined}
                entities={entities}
                addressFieldPrefix="payor"
                title="Fill Payor Address?"
                description="This will populate the payor address fields with the selected entity's address."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label name="payorAddressLine1" className="rw-label">
                    Address Line 1
                  </Label>
                  <TextField
                    name="payorAddressLine1"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payorAddressLine1"
                    className="rw-field-error"
                  />
                </div>
                <div>
                  <Label name="payorAddressLine2" className="rw-label">
                    Address Line 2
                  </Label>
                  <TextField
                    name="payorAddressLine2"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payorAddressLine2"
                    className="rw-field-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label name="payorCity" className="rw-label">
                    City
                  </Label>
                  <TextField
                    name="payorCity"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="payorCity" className="rw-field-error" />
                </div>
                <div>
                  <Label name="payorState" className="rw-label">
                    State
                  </Label>
                  <TextField
                    name="payorState"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="payorState" className="rw-field-error" />
                </div>
                <div>
                  <Label name="payorPostalCode" className="rw-label">
                    Postal Code
                  </Label>
                  <TextField
                    name="payorPostalCode"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payorPostalCode"
                    className="rw-field-error"
                  />
                </div>
              </div>
              <input type="hidden" name="payorCountry" value="US" />
            </fieldset>

            {/* Payee Entity */}
            <fieldset className="order-1 space-y-3 md:border md:border-border md:p-4 md:rounded">
              <legend className="text-sm font-semibold">
                Payee (Who is being paid)
              </legend>

              <EntitySelectorField
                name="payeeEntityId"
                label="Payee"
                entityType="CONTRACTOR"
                entities={filteredEntities}
                placeholder="Select Payee..."
                required={true}
              />

              <div>
                <Label name="payeeName" className="rw-label">
                  Payee Name
                </Label>
                <TextField
                  name="payeeName"
                  validation={{ required: 'Payee name is required' }}
                  errorClassName="rw-input rw-input-error"
                  className="rw-input"
                />
                <FieldError name="payeeName" className="rw-field-error" />
              </div>

              {/* Copy Address Button - shown if payee entity is selected */}
              <CopyAddressButtonContent
                open={openPayeeCopyConfirm}
                onOpenChange={setOpenPayeeCopyConfirm}
                entityId={undefined}
                entities={entities}
                addressFieldPrefix="payee"
                title="Fill Payee Address?"
                description="This will populate the payee address fields with the selected entity's address."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label name="payeeAddressLine1" className="rw-label">
                    Address Line 1
                  </Label>
                  <TextField
                    name="payeeAddressLine1"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payeeAddressLine1"
                    className="rw-field-error"
                  />
                </div>
                <div>
                  <Label name="payeeAddressLine2" className="rw-label">
                    Address Line 2
                  </Label>
                  <TextField
                    name="payeeAddressLine2"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payeeAddressLine2"
                    className="rw-field-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label name="payeeCity" className="rw-label">
                    City
                  </Label>
                  <TextField
                    name="payeeCity"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="payeeCity" className="rw-field-error" />
                </div>
                <div>
                  <Label name="payeeState" className="rw-label">
                    State
                  </Label>
                  <TextField
                    name="payeeState"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="payeeState" className="rw-field-error" />
                </div>
                <div>
                  <Label name="payeePostalCode" className="rw-label">
                    Postal Code
                  </Label>
                  <TextField
                    name="payeePostalCode"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="payeePostalCode"
                    className="rw-field-error"
                  />
                </div>
              </div>
              <input type="hidden" name="payeeCountry" value="US" />
            </fieldset>

            {/* Job Dates */}
            <fieldset className="order-4 space-y-3 md:border md:border-border md:p-4 md:rounded">
              <legend className="text-sm font-semibold">Job Dates</legend>

              <div className="space-y-3">
                <div>
                  <Label
                    name="jobStartedAt"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Start Date
                  </Label>
                  <input
                    type="datetime-local"
                    name="jobStartedAt"
                    className="rw-input"
                  />
                  <FieldError name="jobStartedAt" className="rw-field-error" />
                </div>

                <div>
                  <Label
                    name="jobFinishedAt"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Finish Date
                  </Label>
                  <input
                    type="datetime-local"
                    name="jobFinishedAt"
                    className="rw-input"
                  />
                  <FieldError name="jobFinishedAt" className="rw-field-error" />
                </div>

                <div>
                  <Label
                    name="dueAt"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Due Date
                  </Label>
                  <input type="date" name="dueAt" className="rw-input" />
                  <FieldError name="dueAt" className="rw-field-error" />
                </div>

                <PaidAtFieldContent />
              </div>
            </fieldset>

            {/* Job Location */}
            <fieldset className="order-3 space-y-3 md:border md:border-border md:p-4 md:rounded">
              <legend className="text-sm font-semibold">Job Information</legend>
              <SameAsPayorButton />

              <div>
                <Label name="jobName" className="rw-label">
                  Client Name
                </Label>
                <TextField
                  name="jobName"
                  errorClassName="rw-input rw-input-error"
                  className="rw-input"
                />
                <FieldError name="jobName" className="rw-field-error" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label name="jobAddressLine1" className="rw-label">
                    Address Line 1
                  </Label>
                  <TextField
                    name="jobAddressLine1"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="jobAddressLine1"
                    className="rw-field-error"
                  />
                </div>
                <div>
                  <Label name="jobAddressLine2" className="rw-label">
                    Address Line 2
                  </Label>
                  <TextField
                    name="jobAddressLine2"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError
                    name="jobAddressLine2"
                    className="rw-field-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label name="jobCity" className="rw-label">
                    City
                  </Label>
                  <TextField
                    name="jobCity"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="jobCity" className="rw-field-error" />
                </div>
                <div>
                  <Label name="jobState" className="rw-label">
                    State
                  </Label>
                  <TextField
                    name="jobState"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="jobState" className="rw-field-error" />
                </div>
                <div>
                  <Label name="jobPostalCode" className="rw-label">
                    Postal Code
                  </Label>
                  <TextField
                    name="jobPostalCode"
                    errorClassName="rw-input rw-input-error"
                    className="rw-input"
                  />
                  <FieldError name="jobPostalCode" className="rw-field-error" />
                </div>
              </div>

              <input type="hidden" name="jobCountry" value="US" />
            </fieldset>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <Label name="notes" className="rw-label">
            Notes
          </Label>
          <TextField
            name="notes"
            errorClassName="rw-input rw-input-error"
            className="rw-input"
          />
          <FieldError name="notes" className="rw-field-error" />
        </div>

        <div className="rw-button-group">
          <Submit disabled={props.loading}>Save</Submit>
        </div>
      </Form>
    </div>
  )
}

export default InvoiceForm
