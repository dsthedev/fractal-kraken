import { useEffect, useRef, useState, useMemo } from 'react'

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
import { Checkbox } from 'src/components/ui/checkbox'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'src/components/ui/tabs'

import Visualizer from './CarpetVisualizer'

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

  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [vizPadded, setVizPadded] = useState<boolean>(true)
  const [vizRoll, setVizRoll] = useState<boolean>(true)

  const selectedPiece = useMemo(() => {
    if (!selectedPieceId) return null
    for (const a of areas) {
      const found = a.pieces.find((p) => p.id === selectedPieceId)
      if (found) return found
    }
    return null
  }, [selectedPieceId, areas])

  // Helpers: measurements and processing
  const inchesFromFields = (p: Piece) =>
    p.width && p.width > 0
      ? p.width
      : (p.widthFeet || 0) * 12 + (p.widthInches || 0)
  const lengthFromFields = (p: Piece) =>
    p.length && p.length > 0
      ? p.length
      : (p.lengthFeet || 0) * 12 + (p.lengthInches || 0)

  const formatFeetInches = (totalInches: number) => {
    const ft = Math.floor(totalInches / 12)
    const inch = Math.round(totalInches % 12)
    return `${ft}′${inch}″`
  }

  const processPieces = (pieces: Piece[]) => {
    return pieces.map((p) => {
      const width = inchesFromFields(p)
      const length = lengthFromFields(p)
      const needsFill = width > rollWidth
      const hasExcess = width < rollWidth
      const fillReqWidth = needsFill ? width - rollWidth : 0
      const excessWidth = hasExcess ? rollWidth - width : 0

      return {
        ...p,
        width,
        length,
        needsFill,
        hasExcess,
        fillReqWidth,
        excessWidth,
      }
    })
  }

  // Load from localStorage on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const storedAreas = localStorage.getItem(STORAGE_KEY_AREAS)
    const storedRollWidth = localStorage.getItem(STORAGE_KEY_ROLL_WIDTH)

    if (storedAreas) {
      try {
        const parsed: Area[] = JSON.parse(storedAreas)
        // process pieces to canonicalize measurements
        const processed = parsed.map((a) => ({
          ...a,
          pieces: processPieces(a.pieces),
        }))
        setAreas(processed)
      } catch (error) {
        console.error('Failed to parse stored areas:', error)
      }
    }

    if (storedRollWidth) {
      setRollWidth(parseInt(storedRollWidth))
    }
  }, [])

  // Re-run processing when roll width changes to update needsFill/excess
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (areas.length === 0) return
    setAreas((prev) =>
      prev.map((a) => ({ ...a, pieces: processPieces(a.pieces) }))
    )
  }, [rollWidth])

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
          widthFeet: 12,
          widthInches: 0,
          length: 0,
          width: 144,
          napFollowsLength: true,
          needsFill: false,
          hasExcess: false,
          fillReqWidth: 0,
          excessWidth: 0,
          isNet: false,
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
    // process measurements and compute fill/excess flags before saving
    const processed = processPieces(pieces)
    updateArea(id, { pieces: processed })
  }

  const handleNapDirectionChange = (
    areaId: string,
    napFollowsLength: boolean
  ) => {
    // Update area and all pieces in a SINGLE state update to avoid race conditions
    setAreas((prevAreas) =>
      prevAreas.map((area) => {
        if (area.id === areaId) {
          const updatedPieces = area.pieces.map((piece) => ({
            ...piece,
            napFollowsLength,
          }))
          return {
            ...area,
            napFollowsLength,
            pieces: processPieces(updatedPieces),
          }
        }
        return area
      })
    )
  }

  // Ensure loaded areas get processed once after component mounts
  useEffect(() => {
    if (areas.length === 0) return
    setAreas((prev) =>
      prev.map((a) => ({ ...a, pieces: processPieces(a.pieces) }))
    )
    // run only once after mount / load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const pickWeightedMain = () => {
    const r = Math.random()
    if (r < 0.6) return randomInt(120, 199)
    if (r < 0.9) return randomInt(80, 150)
    return randomInt(36, 100)
  }

  const generateRandomAreas = () => {
    if (areas.length > 0) {
      const confirmed = confirm(
        '⚠️ This will overwrite existing area data. Do you want to continue?'
      )
      if (!confirmed) return
    }

    const areaNames = [
      'Bedroom',
      'Living Room',
      'Hallway',
      'Basement',
      'Office',
      'Kitchen',
      'Dining',
      'Guest Room',
      'Entry',
    ]

    const countAreas = randomInt(2, 5)
    const shuffled = areaNames.sort(() => Math.random() - 0.5)
    const chosen = shuffled.slice(0, countAreas)

    const newAreas: Area[] = chosen.map((name) => {
      const pieceCount = randomInt(1, 3)
      const pieces: Piece[] = []
      for (let i = 0; i < pieceCount; i++) {
        const isMain = i === 0
        const width = isMain ? pickWeightedMain() : randomInt(36, 199)
        const length = isMain ? pickWeightedMain() : randomInt(36, 199)
        const widthFeet = Math.floor(width / 12)
        const widthInches = width % 12
        const lengthFeet = Math.floor(length / 12)
        const lengthInches = length % 12
        pieces.push({
          id: crypto.randomUUID(),
          name: `${name} ${i === 0 ? 'Main' : `Cut ${i}`}`,
          // provide both split fields and numeric fields so the editor inputs populate
          widthFeet,
          widthInches,
          lengthFeet,
          lengthInches,
          width,
          length,
          napFollowsLength: Math.random() < 0.5,
          isNet: Math.random() < 0.5,
          needsFill: false,
          hasExcess: false,
          fillReqWidth: 0,
          excessWidth: 0,
        } as unknown as Piece)
      }
      return {
        id: crypto.randomUUID(),
        name,
        napFollowsLength: true,
        pieces,
      }
    })

    const processed = newAreas.map((a) => ({
      ...a,
      pieces: processPieces(a.pieces),
    }))
    setAreas(processed)
    if (processed.length > 0) {
      const first = processed[0]
      setOpenAreas([first.id])
      setOpenPiecesByArea({
        [first.id]: [first.pieces[0]?.id].filter(Boolean) as string[],
      })
    }
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
                    rollWidth={rollWidth}
                    areaName={area.name}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Report Tables: Main Cut, Fill Requirements, Excess Pieces */}
      {areas.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Report</h3>

          <Tabs defaultValue="main-cut" className="w-full">
            <TabsList>
              <TabsTrigger value="main-cut">Cut List</TabsTrigger>
              <TabsTrigger value="excess">Excess Pieces</TabsTrigger>
              <TabsTrigger value="fill-req">Fill Req.</TabsTrigger>
              <TabsTrigger value="area-measurements">Areas</TabsTrigger>
            </TabsList>

            <TabsContent value="area-measurements">
              <div className="border rounded-lg overflow-hidden mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Piece</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Width</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area) =>
                      area.pieces.map((piece, idx) => {
                        const lenInches =
                          piece.length || lengthFromFields(piece)
                        const widInches = piece.width || inchesFromFields(piece)
                        const lenFt =
                          piece.lengthFeet ?? Math.floor((lenInches || 0) / 12)
                        const lenIn =
                          piece.lengthInches ??
                          Math.round((lenInches || 0) % 12)
                        const widFt =
                          piece.widthFeet ?? Math.floor((widInches || 0) / 12)
                        const widIn =
                          piece.widthInches ?? Math.round((widInches || 0) % 12)
                        const notes = piece.isNet ? 'Padded (+4" )' : ''
                        const hideRow =
                          (lenInches || 0) < 3 || (widInches || 0) < 3
                        return (
                          <TableRow
                            key={piece.id}
                            className={hideRow ? 'hidden' : ''}
                          >
                            <TableCell className="font-medium">
                              {area.name}
                            </TableCell>
                            <TableCell>
                              {piece.name || `Piece ${idx + 1}`}
                            </TableCell>
                            <TableCell>{`${lenFt}′${lenIn}″`}</TableCell>
                            <TableCell>{`${widFt}′${widIn}″`}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {notes}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="main-cut">
              <div className="border rounded-lg overflow-hidden mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Piece</TableHead>
                      <TableHead>Nap</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Width (Main)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area) =>
                      area.pieces.map((piece) => {
                        const widthInches =
                          piece.width || inchesFromFields(piece)
                        const netWidth = widthInches
                        const mainWidth = Math.min(netWidth, rollWidth)
                        const lengthInches =
                          piece.length || lengthFromFields(piece)
                        const displayLen = lengthInches + (piece.isNet ? 4 : 0)
                        const paddedMain = mainWidth + (piece.isNet ? 4 : 0)
                        const displayMainWidth = Math.min(paddedMain, rollWidth)
                        const hideRow =
                          (lengthInches || 0) < 3 || (widthInches || 0) < 3
                        return (
                          <TableRow
                            key={piece.id}
                            className={hideRow ? 'hidden' : ''}
                          >
                            <TableCell className="font-medium">
                              {area.name}
                            </TableCell>
                            <TableCell>{piece.name}</TableCell>
                            <TableCell>
                              {piece.napFollowsLength ? (
                                <MoveVertical />
                              ) : (
                                <MoveHorizontal />
                              )}
                            </TableCell>
                            <TableCell>
                              {piece.needsFill ? (
                                <span className="text-yellow-600">
                                  Needs Fill
                                </span>
                              ) : piece.hasExcess ? (
                                <span className="text-green-600">
                                  Has Excess
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(displayLen)}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(displayMainWidth)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="fill-req">
              <div className="border rounded-lg overflow-hidden mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Piece</TableHead>
                      <TableHead>Nap</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Fill Width</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas
                      .flatMap((area) =>
                        area.pieces.map((piece) => ({
                          ...piece,
                          areaName: area.name,
                        }))
                      )
                      .filter((p) => p.needsFill)
                      .map((p) => {
                        const lengthInches = p.length || lengthFromFields(p)
                        const fillWidth = p.fillReqWidth || 0
                        const hideRow =
                          (lengthInches || 0) < 3 || (fillWidth || 0) < 3
                        return (
                          <TableRow
                            key={p.id}
                            className={hideRow ? 'hidden' : ''}
                          >
                            <TableCell className="font-medium">
                              {p.areaName}
                            </TableCell>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>
                              {p.napFollowsLength ? (
                                <MoveVertical />
                              ) : (
                                <MoveHorizontal />
                              )}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(
                                (lengthInches || 0) + (p.isNet ? 4 : 0)
                              )}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(fillWidth || 0)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="excess">
              <div className="border rounded-lg overflow-hidden mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Piece</TableHead>
                      <TableHead>Nap</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Excess Width</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas
                      .flatMap((area) =>
                        area.pieces.map((piece) => ({
                          ...piece,
                          areaName: area.name,
                        }))
                      )
                      .filter((p) => p.hasExcess)
                      .map((p) => {
                        const lengthInches = p.length || lengthFromFields(p)
                        const excessWidth = p.excessWidth || 0
                        const hideRow =
                          (lengthInches || 0) < 3 || (excessWidth || 0) < 3
                        return (
                          <TableRow
                            key={p.id}
                            className={hideRow ? 'hidden' : ''}
                          >
                            <TableCell className="font-medium">
                              {p.areaName}
                            </TableCell>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>
                              {p.napFollowsLength ? (
                                <MoveVertical />
                              ) : (
                                <MoveHorizontal />
                              )}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(
                                (lengthInches || 0) + (p.isNet ? 4 : 0)
                              )}
                            </TableCell>
                            <TableCell>
                              {formatFeetInches(excessWidth || 0)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Visualizer Section */}
      <div className="mt-6 hidden">
        <h3 className="text-lg font-medium">Visualizer</h3>
        <div className="flex items-center gap-3 mt-3">
          <select
            className="border rounded px-2 py-1"
            value={selectedPieceId ?? ''}
            onChange={(e) => setSelectedPieceId(e.target.value || null)}
          >
            <option value="">Select a piece</option>
            {areas.map((a) => (
              <optgroup key={a.id} label={a.name}>
                {a.pieces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="viz-padded"
              checked={vizPadded}
              onCheckedChange={(v) => setVizPadded(!!v)}
            />
            <Label htmlFor="viz-padded" className="text-sm">
              Show padded (+4")
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="viz-roll"
              checked={vizRoll}
              onCheckedChange={(v) => setVizRoll(!!v)}
            />
            <Label htmlFor="viz-roll" className="text-sm">
              Show roll overlay
            </Label>
          </div>
        </div>

        <div className="mt-4">
          <Visualizer
            piece={selectedPiece}
            rollWidth={rollWidth}
            showPadded={vizPadded}
            showRollOverlay={vizRoll}
          />
        </div>
      </div>

      {/* Usage Tips & Raw Data Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="grand-visualizer">
          <AccordionTrigger>Grand Visualizer</AccordionTrigger>
          <AccordionContent>
            <div className="p-6 text-center text-sm text-muted-foreground">
              Coming Soon!
            </div>
          </AccordionContent>
        </AccordionItem>
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
      <div className="flex justify-between space-4 my-4">
        <Button onClick={triggerFileInput} variant="outline" size="sm">
          Import Data
        </Button>
        <Button
          onClick={generateRandomAreas}
          variant="outline"
          className="w-auto border-slate-800 text-sm dark:border-slate-200"
        >
          Generate Random Sample Areas & Pieces
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportData}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default CarpetCalculatorV1
