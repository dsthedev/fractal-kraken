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

type Entity = {
  id: number
  name: string
  contactName?: string | null
  city?: string | null
  state?: string | null
}

type EntityComboboxProps = {
  entities: Entity[]
  value: number | null
  onSelect: (entityId: number) => void
  label: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

const EntityCombobox = ({
  entities,
  value,
  onSelect,
  label,
  placeholder = 'Select entity...',
  searchPlaceholder = 'Search entities...',
  emptyText = 'No entity found.',
}: EntityComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selectedEntity = entities.find((entity) => entity.id === value)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedEntity ? (
              <span className="truncate">
                {selectedEntity.name}
                {selectedEntity.contactName &&
                  ` (${selectedEntity.contactName})`}
                {selectedEntity.city &&
                  selectedEntity.state &&
                  ` - ${selectedEntity.city}, ${selectedEntity.state}`}
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
                {entities.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={`${entity.name} ${entity.contactName || ''} ${entity.city || ''} ${entity.state || ''}`}
                    onSelect={() => {
                      onSelect(entity.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === entity.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>
                        {entity.name}
                        {entity.contactName && ` (${entity.contactName})`}
                      </span>
                      {entity.city && entity.state && (
                        <span className="text-xs text-muted-foreground">
                          {entity.city}, {entity.state}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default EntityCombobox
