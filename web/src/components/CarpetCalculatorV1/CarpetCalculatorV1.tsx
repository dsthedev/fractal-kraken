import { useEffect, useRef, useState } from 'react'

import {
  Check,
  MoveHorizontal,
  MoveVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import PieceManager, { Piece } from 'src/components/PieceManager/PieceManager'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/components/ui/accordion'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'

const STORAGE_KEY_AREAS = 'carpet-calculator-areas'
const STORAGE_KEY_ROLL_WIDTH = 'carpet-calculator-roll-width'

interface Area {
  id: string
  name: string
  napFollowsLength: boolean
  pieces: Piece[]
}

const CarpetCalculatorV1 = () => {
  const [rollWidth, setRollWidth] = useState<number>(144) // 12 feet = 144 inches
  const [areas, setAreas] = useState<Area[]>([])
  const [openAreas, setOpenAreas] = useState<string[]>([])
  const [openPiecesByArea, setOpenPiecesByArea] = useState<
    Record<string, string[]>
  >({})
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const areaNameRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const storedAreas = localStorage.getItem(STORAGE_KEY_AREAS)
    const storedRollWidth = localStorage.getItem(STORAGE_KEY_ROLL_WIDTH)

    if (storedAreas) {
      try {
        setAreas(JSON.parse(storedAreas))
      } catch (error) {
        console.error('Failed to parse stored areas:', error)
      }
    }

    if (storedRollWidth) {
      setRollWidth(parseInt(storedRollWidth))
    }
  }, [])

  // Save areas to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(areas))
  }, [areas])

  // Save rollWidth to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLL_WIDTH, rollWidth.toString())
  }, [rollWidth])

  const addArea = () => {
    const newAreaId = crypto.randomUUID()
    const firstPieceId = crypto.randomUUID()

    const newArea: Area = {
      id: newAreaId,
      name: `Area ${areas.length + 1}`,
      napFollowsLength: true,
      pieces: [
        {
          id: firstPieceId,
          name: 'Main Cut',
          lengthFeet: 0,
          lengthInches: 0,
          widthFeet: 0,
          widthInches: 0,
          length: 0,
          width: 0,
          napFollowsLength: true,
          isUsed: false,
          isFilled: false,
        },
      ],
    }
    setAreas([...areas, newArea])
    // Open only the new area
    setOpenAreas([newArea.id])
    // Open the first piece
    setOpenPiecesByArea((prev) => ({
      ...prev,
      [newAreaId]: [firstPieceId],
    }))
    // Focus and select area name input
    setTimeout(() => {
      const input = areaNameRefs.current[newAreaId]
      if (input) {
        input.focus()
        requestAnimationFrame(() => {
          input.select()
        })
      }
    }, 100)
  }

  const removeArea = (id: string) => {
    setAreas(areas.filter((a) => a.id !== id))
  }

  const clearAll = () => {
    setAreas([])
    localStorage.removeItem(STORAGE_KEY_AREAS)
  }

  const updateArea = (id: string, updates: Partial<Area>) => {
    setAreas(areas.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const updateAreaPieces = (id: string, pieces: Piece[]) => {
    updateArea(id, { pieces })
  }

  const handleNapDirectionChange = (
    areaId: string,
    napFollowsLength: boolean
  ) => {
    // Update area and all pieces in a SINGLE state update to avoid race conditions
    setAreas((prevAreas) =>
      prevAreas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            napFollowsLength,
            pieces: area.pieces.map((piece) => ({
              ...piece,
              napFollowsLength,
            })),
          }
        }
        return area
      })
    )
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(areas, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `carpet-calculator-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Validate that it's an array
        if (!Array.isArray(importedData)) {
          alert('Invalid data format: Expected an array of areas')
          return
        }

        // If there's existing data, confirm before overwriting
        if (areas.length > 0) {
          const confirmed = confirm(
            '⚠️ Warning: This will overwrite all existing data. Are you sure you want to continue?'
          )
          if (!confirmed) {
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            return
          }
        }

        setAreas(importedData)
        alert('Data imported successfully!')
      } catch (error) {
        alert('Error importing data: Invalid JSON format')
        console.error('Import error:', error)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Roll Width Selector */}
      <div className="space-y-2">
        <Label htmlFor="rollWidth">Select Roll Width</Label>
        <Select
          value={rollWidth.toString()}
          onValueChange={(value) => setRollWidth(parseInt(value))}
        >
          <SelectTrigger id="rollWidth" className="w-[200px]">
            <SelectValue placeholder="Select roll width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="144">{'12 feet (144")'}</SelectItem>
            <SelectItem value="162">{'13.5 feet (162")'}</SelectItem>
            <SelectItem value="180">{'15 feet (180")'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area Management Buttons */}
      <div className="flex gap-2">
        <Button onClick={addArea} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Area
        </Button>
        {areas.length > 0 && (
          <Button onClick={clearAll} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Areas Accordion */}
      {areas.length > 0 && (
        <Accordion
          type="multiple"
          value={openAreas}
          onValueChange={setOpenAreas}
          className="w-full"
        >
          {areas.map((area) => (
            <AccordionItem
              key={area.id}
              value={area.id}
              className="bg-slate-50 dark:bg-slate-950 rounded-md border"
            >
              <AccordionTrigger className="bg-slate-100 dark:bg-slate-900 rounded-md px-4 py-2 w-full flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {editingAreaId === area.id ? (
                    <Input
                      ref={(el) => {
                        areaNameRefs.current[area.id] = el
                      }}
                      autoFocus
                      value={area.name}
                      onChange={(e) =>
                        updateArea(area.id, { name: e.target.value })
                      }
                      onFocus={(e) => {
                        requestAnimationFrame(() => {
                          e.target.select()
                        })
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') {
                          setEditingAreaId(null)
                        }
                      }}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      onBlur={() => setEditingAreaId(null)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium h-8"
                      placeholder="Area name"
                    />
                  ) : (
                    <span className="text-left font-medium flex-1">
                      {area.name || 'Unnamed Area'}
                    </span>
                  )}
                  <div
                    role="button"
                    tabIndex={0}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setEditingAreaId(
                        editingAreaId === area.id ? null : area.id
                      )
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingAreaId(
                          editingAreaId === area.id ? null : area.id
                        )
                      }
                    }}
                  >
                    {editingAreaId === area.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4">
                  {/* Area Controls */}
                  <div className="flex items-center justify-end gap-4 pb-4 border-b">
                    <Button
                      variant="sky"
                      size="lg"
                      className="mb-2 gap-2"
                      onClick={() => {
                        handleNapDirectionChange(
                          area.id,
                          !area.napFollowsLength
                        )
                      }}
                    >
                      Direction:
                      {area.napFollowsLength ? (
                        <MoveVertical className="h-4 w-4" />
                      ) : (
                        <MoveHorizontal className="h-4 w-4" />
                      )}
                      <span className="text-sm whitespace-nowrap hidden">
                        Nap{' '}
                        {area.napFollowsLength
                          ? 'follows length'
                          : 'follows width'}
                      </span>
                    </Button>
                    <Button
                      onClick={() => removeArea(area.id)}
                      variant="destructive"
                      size="sm"
                      className="mb-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Pieces */}
                  <PieceManager
                    pieces={area.pieces}
                    onChange={(pieces) => updateAreaPieces(area.id, pieces)}
                    areaNapFollowsLength={area.napFollowsLength}
                    onNapDirectionChange={(napFollowsLength) =>
                      handleNapDirectionChange(area.id, napFollowsLength)
                    }
                    openPieces={openPiecesByArea[area.id] || []}
                    onOpenPiecesChange={(pieceIds) =>
                      setOpenPiecesByArea((prev) => ({
                        ...prev,
                        [area.id]: pieceIds,
                      }))
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Report Table */}
      {areas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Report</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Nap Direction</TableHead>
                  <TableHead>Pieces</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>
                      {area.napFollowsLength ? (
                        <MoveVertical />
                      ) : (
                        <MoveHorizontal />
                      )}
                    </TableCell>
                    <TableCell>{area.pieces.length}</TableCell>
                    <TableCell>
                      {area.pieces.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {area.pieces.map((piece, idx) => (
                            <li
                              key={piece.id}
                              className="text-muted-foreground"
                            >
                              {piece.name || `Piece ${idx + 1}`}:{' '}
                              {piece.lengthFeet || 0}′{piece.lengthInches || 0}″
                              × {piece.widthFeet || 0}′{piece.widthInches || 0}″
                              {piece.isUsed && ' (Used)'}
                              {piece.isFilled && ' (Filled)'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No pieces
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Usage Tips & Raw Data Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="usage-tips">
          <AccordionTrigger>Usage Tips</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Click the pencil icon to edit area or piece names inline</li>
              <li>
                Use the nap direction toggle to match carpet orientation
                (vertical/horizontal)
              </li>
              <li>
                Toggle between feet/inches and decimal inches for easier
                measuring
              </li>
              <li>
                The first piece is automatically named "Main Cut", additional
                pieces are "Fill #N"
              </li>
              <li>
                All data is saved automatically to your browser's local storage
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {areas.length > 0 && (
          <AccordionItem value="raw-data">
            <AccordionTrigger>Show Raw Data</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{JSON.stringify(areas, null, 2)}</code>
              </pre>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleExportData} variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      <Button onClick={triggerFileInput} variant="outline" size="sm">
        Import Data
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportData}
        className="hidden"
      />
    </div>
  )
}

export default CarpetCalculatorV1
