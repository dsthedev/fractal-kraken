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

type Action = {
  id: number
  name: string
  description?: string | null
}

type ActionComboboxProps = {
  actions?: Action[]
  value: number | null | undefined
  onSelect: (actionId: number) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

const ActionCombobox = ({
  actions = [],
  value,
  onSelect,
  label = 'Action',
  placeholder = 'Select action...',
  searchPlaceholder = 'Search actions...',
  emptyText = 'No action found.',
}: ActionComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selected = actions.find((a) => a.id === value)

  return (
    <div className="space-y-2">
      <label htmlFor="action-combobox" className="block font-light">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="action-combobox"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected ? (
              <span className="truncate">{selected.name}</span>
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
                {actions.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={a.name}
                    onSelect={() => {
                      onSelect(a.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === a.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{a.name}</span>
                      {a.description && (
                        <span className="text-xs text-muted-foreground">
                          {a.description}
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

export default ActionCombobox
