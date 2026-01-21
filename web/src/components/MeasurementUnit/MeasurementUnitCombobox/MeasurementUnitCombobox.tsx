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

type MeasurementUnit = {
  id: number
  fullName: string
  pluralName: string
  shortName?: string | null
  symbol?: string | null
  // dimension: string
  description?: string | null
}

type MeasurementUnitComboboxProps = {
  measurementUnits: MeasurementUnit[]
  value: number | null | undefined
  onSelect: (unitId: number) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

const MeasurementUnitCombobox = ({
  measurementUnits,
  value,
  onSelect,
  label = 'Measurement Unit',
  placeholder = 'Select unit...',
  searchPlaceholder = 'Search units...',
  emptyText = 'No unit found.',
}: MeasurementUnitComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selectedUnit = measurementUnits.find((unit) => unit.id === value)

  const formatUnitLabel = (unit: MeasurementUnit) => {
    return `${unit.fullName}${unit.symbol ? ` (${unit.symbol})` : ''}`
  }

  return (
    <div className="space-y-2">
      <label htmlFor="unit-combobox" className="block text-sm font-medium">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="unit-combobox"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUnit ? (
              <span className="truncate">{formatUnitLabel(selectedUnit)}</span>
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
                {measurementUnits.map((unit) => {
                  const label = formatUnitLabel(unit)
                  return (
                    <CommandItem
                      key={unit.id}
                      value={label}
                      onSelect={() => {
                        onSelect(unit.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === unit.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{label}</span>
                        {unit.description && (
                          <span className="text-xs text-muted-foreground">
                            {unit.description}
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

export default MeasurementUnitCombobox
