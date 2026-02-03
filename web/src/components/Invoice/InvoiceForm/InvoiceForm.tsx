import { useMemo, useState } from 'react'

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
} from '@cedarjs/forms'
import { Link, routes } from '@cedarjs/router'
import type { TypedDocumentNode } from '@cedarjs/web'
import { useQuery } from '@cedarjs/web'

import { useAuth } from 'src/auth'
import { EntitySelector } from 'src/components/Estimate/EstimateForm/EntitySelector'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'src/components/ui/alert-dialog'
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

  // Invoice header state
  const weekNumber = useMemo(() => getWeekNumber(new Date()), [])
  const [invoiceNumber, setInvoiceNumber] = useState(
    props.invoice?.invoiceNumber || buildTitle(weekNumber, '', '')
  )
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateInvoiceInput['status']
  >(props.invoice?.status || 'DRAFT')
  const [selectedPayStatus, setSelectedPayStatus] = useState<
    UpdateInvoiceInput['payStatus']
  >(props.invoice?.payStatus || 'UNPAID')
  const [openStatus, setOpenStatus] = useState(false)
  const [openPayStatus, setOpenPayStatus] = useState(false)
  const [openSourceDialog, setOpenSourceDialog] = useState(false)
  const [openPayorCopyConfirm, setOpenPayorCopyConfirm] = useState(false)
  const [openPayeeCopyConfirm, setOpenPayeeCopyConfirm] = useState(false)

  // Billing parties state
  const [payorEntityId, setPayorEntityId] = useState<number | undefined>(
    props.invoice?.payorEntityId || undefined
  )
  const [payorAddressLine1, setPayorAddressLine1] = useState(
    props.invoice?.payorAddressLine1 || ''
  )
  const [payorAddressLine2, setPayorAddressLine2] = useState(
    props.invoice?.payorAddressLine2 || ''
  )
  const [payorCity, setPayorCity] = useState(props.invoice?.payorCity || '')
  const [payorState, setPayorState] = useState(props.invoice?.payorState || '')
  const [payorPostalCode, setPayorPostalCode] = useState(
    props.invoice?.payorPostalCode || ''
  )

  const [payeeEntityId, setPayeeEntityId] = useState<number | undefined>(
    props.invoice?.payeeEntityId || undefined
  )
  const [payeeAddressLine1, setPayeeAddressLine1] = useState(
    props.invoice?.payeeAddressLine1 || ''
  )
  const [payeeAddressLine2, setPayeeAddressLine2] = useState(
    props.invoice?.payeeAddressLine2 || ''
  )
  const [payeeCity, setPayeeCity] = useState(props.invoice?.payeeCity || '')
  const [payeeState, setPayeeState] = useState(props.invoice?.payeeState || '')
  const [payeePostalCode, setPayeePostalCode] = useState(
    props.invoice?.payeePostalCode || ''
  )

  // Job dates state
  // Calculate default due date (today + 30 days) for new invoices
  const getDefaultDueDate = () => {
    if (props.invoice?.dueAt) return props.invoice.dueAt
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const [jobStartedAt, setJobStartedAt] = useState(
    props.invoice?.jobStartedAt || ''
  )
  const [jobFinishedAt, setJobFinishedAt] = useState(
    props.invoice?.jobFinishedAt || ''
  )
  const [dueAt, setDueAt] = useState(getDefaultDueDate())
  const [paidAt, setPaidAt] = useState(props.invoice?.paidAt || '')

  // Job location state
  const [jobAddressLine1, setJobAddressLine1] = useState(
    props.invoice?.jobAddressLine1 || ''
  )
  const [jobAddressLine2, setJobAddressLine2] = useState(
    props.invoice?.jobAddressLine2 || ''
  )
  const [jobCity, setJobCity] = useState(props.invoice?.jobCity || '')
  const [jobState, setJobState] = useState(props.invoice?.jobState || '')
  const [jobPostalCode, setJobPostalCode] = useState(
    props.invoice?.jobPostalCode || ''
  )
  const [jobCountry, setJobCountry] = useState(
    props.invoice?.jobCountry || 'US'
  )

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
      <Form<FormInvoice> onSubmit={onSubmit} error={props.error}>
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
                <input
                  name="invoiceNumber"
                  type="text"
                  value={invoiceNumber}
                  placeholder="Week # - Retailer - Client"
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="rw-input flex-1 w-full"
                />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="w-full sm:w-auto justify-start sm:justify-center p-0 sm:px-3 sm:py-2"
                  onClick={() => {
                    const newNumber = buildTitle(weekNumber, '', '')
                    setInvoiceNumber(newNumber)
                  }}
                >
                  Generate
                </Button>
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
                        {['DRAFT', 'SENT', 'ARCHIVED'].map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={(value) => {
                              setSelectedStatus(
                                value.toUpperCase() as UpdateInvoiceInput['status']
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

              <input type="hidden" name="status" value={selectedStatus} />
              <FieldError name="status" className="rw-field-error" />
            </div>
          </div>

          {/* Payment Status - Only visible if status is not DRAFT */}
          {selectedStatus !== 'DRAFT' && (
            <div className="w-full sm:w-48">
              <Label
                name="payStatus"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Payment Status
              </Label>

              <Popover open={openPayStatus} onOpenChange={setOpenPayStatus}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPayStatus}
                    className={cn(
                      'justify-between w-full',
                      !selectedPayStatus && 'text-muted-foreground'
                    )}
                  >
                    {selectedPayStatus || 'Unpaid'}
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
                        {['UNPAID', 'OUTSTANDING', 'PAID'].map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={(value) => {
                              setSelectedPayStatus(
                                value.toUpperCase() as UpdateInvoiceInput['payStatus']
                              )
                              setOpenPayStatus(false)
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

              <input type="hidden" name="payStatus" value={selectedPayStatus} />
              <FieldError name="payStatus" className="rw-field-error" />
            </div>
          )}

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

        {/* Billing Parties Section */}
        <div className="mt-6 space-y-6 border-b border-border pb-6">
          {/* Payor Entity */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">
              Payor (Who is paying)
            </legend>

            <EntitySelector
              label="Payor"
              placeholder="Select Payor..."
              fieldName="payorEntityId"
              entityType="CLIENT"
              entities={filteredEntities}
              selectedEntity={
                payorEntityId
                  ? filteredEntities?.find((e) => e.id === payorEntityId)
                  : undefined
              }
              onEntitySelect={(entity) => {
                setPayorEntityId(entity?.id || undefined)
              }}
              onEntityCreate={(entity) => {
                setPayorEntityId(entity.id)
              }}
              hiddenInputValue={payorEntityId || ''}
            />

            {/* Copy Address Button - shown if payor entity is selected */}
            {payorEntityId && (
              <AlertDialog
                open={openPayorCopyConfirm}
                onOpenChange={setOpenPayorCopyConfirm}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenPayorCopyConfirm(true)}
                >
                  Use Payor Info
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Fill Payor Address?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will populate the payor address fields with the
                      selected entity&apos;s address. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-4 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const selectedEntity = entities?.find(
                          (e) => e.id === payorEntityId
                        )
                        if (selectedEntity) {
                          setPayorAddressLine1(
                            selectedEntity.addressLine1 || ''
                          )
                          setPayorAddressLine2(
                            selectedEntity.addressLine2 || ''
                          )
                          setPayorCity(selectedEntity.city || '')
                          setPayorState(selectedEntity.state || '')
                          setPayorPostalCode(selectedEntity.postalCode || '')
                        }
                        setOpenPayorCopyConfirm(false)
                      }}
                    >
                      Fill Address
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label
                  name="payorAddressLine1"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Address Line 1
                </Label>
                <input
                  type="text"
                  name="payorAddressLine1"
                  value={payorAddressLine1}
                  onChange={(e) => setPayorAddressLine1(e.target.value)}
                  className="rw-input"
                />
                <FieldError
                  name="payorAddressLine1"
                  className="rw-field-error"
                />
              </div>

              <div>
                <Label
                  name="payorAddressLine2"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Address Line 2
                </Label>
                <input
                  type="text"
                  name="payorAddressLine2"
                  value={payorAddressLine2}
                  onChange={(e) => setPayorAddressLine2(e.target.value)}
                  className="rw-input"
                />
                <FieldError
                  name="payorAddressLine2"
                  className="rw-field-error"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label
                  name="payorCity"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  City
                </Label>
                <input
                  type="text"
                  name="payorCity"
                  value={payorCity}
                  onChange={(e) => setPayorCity(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payorCity" className="rw-field-error" />
              </div>

              <div>
                <Label
                  name="payorState"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  State
                </Label>
                <input
                  type="text"
                  name="payorState"
                  value={payorState}
                  onChange={(e) => setPayorState(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payorState" className="rw-field-error" />
              </div>

              <div>
                <Label
                  name="payorPostalCode"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Postal Code
                </Label>
                <input
                  type="text"
                  name="payorPostalCode"
                  value={payorPostalCode}
                  onChange={(e) => setPayorPostalCode(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payorPostalCode" className="rw-field-error" />
              </div>

              <div>
                <input type="hidden" name="payorCountry" value="US" disabled />
              </div>
            </div>
          </fieldset>

          {/* Payee Entity */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">
              Payee (Who is being paid)
            </legend>

            <EntitySelector
              label="Payee"
              placeholder="Select Payee..."
              fieldName="payeeEntityId"
              entityType="CONTRACTOR"
              entities={filteredEntities}
              selectedEntity={
                payeeEntityId
                  ? filteredEntities?.find((e) => e.id === payeeEntityId)
                  : undefined
              }
              onEntitySelect={(entity) => {
                setPayeeEntityId(entity?.id || undefined)
              }}
              onEntityCreate={(entity) => {
                setPayeeEntityId(entity.id)
              }}
              hiddenInputValue={payeeEntityId || ''}
            />

            {/* Copy Address Button - shown if payee entity is selected */}
            {payeeEntityId && (
              <AlertDialog
                open={openPayeeCopyConfirm}
                onOpenChange={setOpenPayeeCopyConfirm}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenPayeeCopyConfirm(true)}
                >
                  Use Payee Info
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Fill Payee Address?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will populate the payee address fields with the
                      selected entity&apos;s address. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-4 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const selectedEntity = entities?.find(
                          (e) => e.id === payeeEntityId
                        )
                        if (selectedEntity) {
                          setPayeeAddressLine1(
                            selectedEntity.addressLine1 || ''
                          )
                          setPayeeAddressLine2(
                            selectedEntity.addressLine2 || ''
                          )
                          setPayeeCity(selectedEntity.city || '')
                          setPayeeState(selectedEntity.state || '')
                          setPayeePostalCode(selectedEntity.postalCode || '')
                        }
                        setOpenPayeeCopyConfirm(false)
                      }}
                    >
                      Fill Address
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label
                  name="payeeAddressLine1"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Address Line 1
                </Label>
                <input
                  type="text"
                  name="payeeAddressLine1"
                  value={payeeAddressLine1}
                  onChange={(e) => setPayeeAddressLine1(e.target.value)}
                  className="rw-input"
                />
                <FieldError
                  name="payeeAddressLine1"
                  className="rw-field-error"
                />
              </div>

              <div>
                <Label
                  name="payeeAddressLine2"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Address Line 2
                </Label>
                <input
                  type="text"
                  name="payeeAddressLine2"
                  value={payeeAddressLine2}
                  onChange={(e) => setPayeeAddressLine2(e.target.value)}
                  className="rw-input"
                />
                <FieldError
                  name="payeeAddressLine2"
                  className="rw-field-error"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label
                  name="payeeCity"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  City
                </Label>
                <input
                  type="text"
                  name="payeeCity"
                  value={payeeCity}
                  onChange={(e) => setPayeeCity(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payeeCity" className="rw-field-error" />
              </div>

              <div>
                <Label
                  name="payeeState"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  State
                </Label>
                <input
                  type="text"
                  name="payeeState"
                  value={payeeState}
                  onChange={(e) => setPayeeState(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payeeState" className="rw-field-error" />
              </div>

              <div>
                <Label
                  name="payeePostalCode"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Postal Code
                </Label>
                <input
                  type="text"
                  name="payeePostalCode"
                  value={payeePostalCode}
                  onChange={(e) => setPayeePostalCode(e.target.value)}
                  className="rw-input"
                />
                <FieldError name="payeePostalCode" className="rw-field-error" />
              </div>

              <div>
                <input type="hidden" name="payeeCountry" value="US" disabled />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Job Dates Section */}
        <div className="mt-6 space-y-4 border-b border-border pb-6">
          <h3 className="text-sm font-semibold">Job Dates</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                name="jobStartedAt"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Job Started At
              </Label>
              <input
                type="datetime-local"
                name="jobStartedAt"
                value={jobStartedAt}
                onChange={(e) => setJobStartedAt(e.target.value)}
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
                Job Finished At
              </Label>
              <input
                type="datetime-local"
                name="jobFinishedAt"
                value={jobFinishedAt}
                onChange={(e) => setJobFinishedAt(e.target.value)}
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
                Due At
              </Label>
              <input
                type="date"
                name="dueAt"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="rw-input"
              />
              <FieldError name="dueAt" className="rw-field-error" />
            </div>

            <div>
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
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                disabled={selectedPayStatus !== 'PAID'}
                className="rw-input disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <FieldError name="paidAt" className="rw-field-error" />
            </div>
          </div>
        </div>

        {/* Job Location Section */}
        <div className="mt-6 space-y-4 border-b border-border pb-6">
          <h3 className="text-sm font-semibold">Job Location</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                name="jobAddressLine1"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Address Line 1
              </Label>
              <input
                type="text"
                name="jobAddressLine1"
                value={jobAddressLine1}
                onChange={(e) => setJobAddressLine1(e.target.value)}
                className="rw-input"
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
              <input
                type="text"
                name="jobAddressLine2"
                value={jobAddressLine2}
                onChange={(e) => setJobAddressLine2(e.target.value)}
                className="rw-input"
              />
              <FieldError name="jobAddressLine2" className="rw-field-error" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label
                name="jobCity"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                City
              </Label>
              <input
                type="text"
                name="jobCity"
                value={jobCity}
                onChange={(e) => setJobCity(e.target.value)}
                className="rw-input"
              />
              <FieldError name="jobCity" className="rw-field-error" />
            </div>

            <div>
              <Label
                name="jobState"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                State
              </Label>
              <input
                type="text"
                name="jobState"
                value={jobState}
                onChange={(e) => setJobState(e.target.value)}
                className="rw-input"
              />
              <FieldError name="jobState" className="rw-field-error" />
            </div>

            <div>
              <Label
                name="jobPostalCode"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Postal Code
              </Label>
              <input
                type="text"
                name="jobPostalCode"
                value={jobPostalCode}
                onChange={(e) => setJobPostalCode(e.target.value)}
                className="rw-input"
              />
              <FieldError name="jobPostalCode" className="rw-field-error" />
            </div>

            <div>
              <Label
                name="jobCountry"
                className="rw-label"
                errorClassName="rw-label rw-label-error"
              >
                Country
              </Label>
              <input
                type="text"
                name="jobCountry"
                value={jobCountry}
                onChange={(e) => setJobCountry(e.target.value)}
                className="rw-input"
              />
              <FieldError name="jobCountry" className="rw-field-error" />
            </div>
          </div>
        </div>

        {/* TODO: Add remaining invoice form fields here */}
        {/* - Source reference button */}
        {/* - Billing parties (payor/payee) */}
        {/* - Job dates */}
        {/* - Job location */}
        {/* - Billable items */}
        {/* - Totals */}
        {/* - Notes */}

        <div className="rw-button-group">
          <Submit disabled={props.loading}>Save</Submit>
        </div>
      </Form>
    </div>
  )
}

export default InvoiceForm
