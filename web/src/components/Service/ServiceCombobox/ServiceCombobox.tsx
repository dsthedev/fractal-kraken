import { useState } from 'react'

import { Check, ChevronsUpDown } from 'lucide-react'

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/components/ui/popover'
import { cn } from 'src/lib/utils'

type Service = {
  id: number
  action: string
  material: string
  context?: string | null
  description?: string | null
}

type ServiceComboboxProps = {
  services: Service[]
  value: number | null | undefined
  onSelect: (serviceId: number) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

const ServiceCombobox = ({
  services,
  value,
  onSelect,
  label = 'Service',
  placeholder = 'Select service...',
  searchPlaceholder = 'Search services...',
  emptyText = 'No service found.',
}: ServiceComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selectedService = services.find((service) => service.id === value)

  const formatServiceLabel = (service: Service) => {
    return `${service.action} ${service.material}${service.context ? ` (${service.context})` : ''}`
  }

  return (
    <div className="space-y-2">
      <label htmlFor="service-combobox" className="block text-sm font-medium">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="service-combobox"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedService ? (
              <span className="truncate">
                {formatServiceLabel(selectedService)}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {services.map((service) => {
                  const label = formatServiceLabel(service)
                  return (
                    <CommandItem
                      key={service.id}
                      value={label}
                      onSelect={() => {
                        onSelect(service.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === service.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{label}</span>
                        {service.description && (
                          <span className="text-xs text-muted-foreground">
                            {service.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ServiceCombobox
