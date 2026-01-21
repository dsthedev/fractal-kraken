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

type Material = {
  id: number
  name: string
  description?: string | null
}

type MaterialComboboxProps = {
  materials?: Material[]
  value: number | null | undefined
  onSelect: (materialId: number) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

const MaterialCombobox = ({
  materials = [],
  value,
  onSelect,
  label = 'Material',
  placeholder = 'Select material...',
  searchPlaceholder = 'Search materials...',
  emptyText = 'No material found.',
}: MaterialComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selected = materials.find((m) => m.id === value)

  return (
    <div className="space-y-2">
      <label htmlFor="material-combobox" className="block text-sm font-medium">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="material-combobox"
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
                {materials.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    onSelect={() => {
                      onSelect(m.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === m.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{m.name}</span>
                      {m.description && (
                        <span className="text-xs text-muted-foreground">
                          {m.description}
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

export default MaterialCombobox
