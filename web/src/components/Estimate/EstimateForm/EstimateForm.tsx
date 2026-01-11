import { useState } from 'react'

import type {
  EditEstimateById,
  UpdateEstimateInput,
  Entity,
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

const EstimateForm = (props: EstimateFormProps) => {
  const { currentUser } = useAuth()
  const [openStatus, setOpenStatus] = useState(false)
  const [openRetailer, setOpenRetailer] = useState(false)
  const [openClient, setOpenClient] = useState(false)
  const [openInstaller, setOpenInstaller] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(
    props.estimate?.status || 'DRAFT'
  )
  const [selectedRetailerEntity, setSelectedRetailerEntity] = useState<
    Entity | undefined
  >(props.estimate?.retailerEntity || undefined)
  const [selectedClientEntity, setSelectedClientEntity] = useState<
    Entity | undefined
  >(props.estimate?.clientEntity || undefined)
  const [selectedInstallerEntity, setSelectedInstallerEntity] = useState<
    Entity | undefined
  >(props.estimate?.installerEntity || undefined)

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

        {/* Title - Auto-generated based on week number, retailer, and client */}
        <Label
          name="title"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Title
        </Label>

        <TextField
          name="title"
          defaultValue={isNewEstimate ? currentTitle : props.estimate?.title}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          readOnly={isNewEstimate}
        />

        <FieldError name="title" className="rw-field-error" />

        {/* Status - Combobox with DRAFT as default for new estimates */}
        <Label
          name="status"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Status
        </Label>

        <div className="flex gap-2">
          <Popover open={openStatus} onOpenChange={setOpenStatus}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatus}
                className={cn(
                  'flex-1 justify-between',
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
                    {['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map(
                      (status) => (
                        <CommandItem
                          key={status}
                          value={status}
                          onSelect={(value) => {
                            setSelectedStatus(value)
                            setOpenStatus(false)
                          }}
                        >
                          {status}
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <input type="hidden" name="status" value={selectedStatus} />

        <FieldError name="status" className="rw-field-error" />

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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                +
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Installer</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Feature for adding new installers coming soon
              </p>
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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                +
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Feature for adding new clients coming soon
              </p>
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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                +
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Retailer</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Feature for adding new retailers coming soon
              </p>
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

        {/* Job Address Fields - Auto-filled from client address if selected */}
        <Label
          name="jobAddressLine1"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job Address Line 1
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

        <Label
          name="jobAddressLine2"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job Address Line 2
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

        <Label
          name="jobCity"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job City
        </Label>

        <TextField
          name="jobCity"
          defaultValue={selectedClientEntity?.city || props.estimate?.jobCity}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobCity" className="rw-field-error" />

        <Label
          name="jobState"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job State
        </Label>

        <TextField
          name="jobState"
          defaultValue={selectedClientEntity?.state || props.estimate?.jobState}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobState" className="rw-field-error" />

        <Label
          name="jobPostalCode"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Job Postal Code
        </Label>

        <TextField
          name="jobPostalCode"
          defaultValue={
            selectedClientEntity?.postalCode || props.estimate?.jobPostalCode
          }
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="jobPostalCode" className="rw-field-error" />

        {/* Job Country - Hidden, defaults to United States */}
        <input type="hidden" name="jobCountry" value="United States" />

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
