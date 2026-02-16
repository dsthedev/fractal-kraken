import { useRef, useState } from 'react'

import {
  Check,
  MoveHorizontal,
  MoveVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

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

export interface Piece {
  id: string
  name: string
  lengthFeet: number
  lengthInches: number
  widthFeet: number
  widthInches: number
  length: number
  width: number
  napFollowsLength: boolean
  isUsed: boolean
  isFilled: boolean
}

interface PieceManagerProps {
  pieces: Piece[]
  onChange: (pieces: Piece[]) => void
  areaNapFollowsLength: boolean
  onNapDirectionChange?: (napFollowsLength: boolean) => void
  openPieces: string[]
  onOpenPiecesChange: (pieceIds: string[]) => void
}

const PieceManager = ({
  pieces,
  onChange,
  areaNapFollowsLength,
  onNapDirectionChange,
  openPieces,
  onOpenPiecesChange,
}: PieceManagerProps) => {
  const [editAsInches, setEditAsInches] = useState(false)
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null)
  const pieceNameRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const addPiece = () => {
    const pieceCount = pieces.length
    const defaultName = pieceCount === 0 ? 'Main Cut' : `Fill #${pieceCount}`

    const newPiece: Piece = {
      id: crypto.randomUUID(),
      name: defaultName,
      lengthFeet: 0,
      lengthInches: 0,
      widthFeet: 0,
      widthInches: 0,
      length: 0,
      width: 0,
      napFollowsLength: areaNapFollowsLength,
      isUsed: false,
      isFilled: false,
    }
    onChange([...pieces, newPiece])
    onOpenPiecesChange([newPiece.id])
    // Focus and select piece name input
    setTimeout(() => {
      const input = pieceNameRefs.current[newPiece.id]
      if (input) {
        input.focus()
        requestAnimationFrame(() => {
          input.select()
        })
      }
    }, 100)
  }

  const removePiece = (id: string) => {
    onChange(pieces.filter((p) => p.id !== id))
  }

  const updatePiece = (id: string, updates: Partial<Piece>) => {
    onChange(pieces.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const clearAll = () => {
    onChange([])
  }

  if (pieces.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No pieces added yet</p>
        <Button onClick={addPiece} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Piece
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={addPiece} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Piece
          </Button>
          <Button onClick={clearAll} variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={openPieces}
        onValueChange={onOpenPiecesChange}
        className="space-y-4"
      >
        {pieces.map((piece) => (
          <AccordionItem
            key={piece.id}
            value={piece.id}
            className="border rounded-lg bg-card"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  {editingPieceId === piece.id ? (
                    <Input
                      ref={(el) => {
                        pieceNameRefs.current[piece.id] = el
                      }}
                      autoFocus
                      value={piece.name}
                      onChange={(e) =>
                        updatePiece(piece.id, { name: e.target.value })
                      }
                      onFocus={(e) => {
                        requestAnimationFrame(() => {
                          e.target.select()
                        })
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') {
                          setEditingPieceId(null)
                        }
                      }}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      onBlur={() => setEditingPieceId(null)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium h-8"
                      placeholder="Piece name"
                    />
                  ) : (
                    <div className="text-left">
                      <p className="text-sm font-medium">{piece.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {piece.id.slice(0, 8)}
                      </p>
                    </div>
                  )}
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditingPieceId(
                      editingPieceId === piece.id ? null : piece.id
                    )
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {editingPieceId === piece.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="sky"
                    size="lg"
                    onClick={() => {
                      const newValue = !piece.napFollowsLength
                      onNapDirectionChange?.(newValue)
                    }}
                    title={
                      piece.napFollowsLength
                        ? 'Nap follows length'
                        : 'Nap follows width'
                    }
                  >
                    Direction:
                    {piece.napFollowsLength ? (
                      <MoveVertical className="h-4 w-4" />
                    ) : (
                      <MoveHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditAsInches(!editAsInches)}
                    variant="secondary"
                    size="sm"
                    title={
                      editAsInches
                        ? 'Switch to feet/inches'
                        : 'Switch to inches only'
                    }
                  >
                    {editAsInches ? 'Inches → Feet' : 'Feet → Inches'}
                  </Button>
                  <Button
                    onClick={() => removePiece(piece.id)}
                    variant="destructive"
                    size="icon-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editAsInches ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4">
                  <div className="space-y-2">
                    <Label htmlFor={`length-${piece.id}`}>
                      Length (inches)
                    </Label>
                    <Input
                      className="text-xl"
                      id={`length-${piece.id}`}
                      type="number"
                      value={piece.length || ''}
                      onChange={(e) => {
                        const totalInches = parseInt(e.target.value) || 0
                        updatePiece(piece.id, {
                          length: totalInches,
                          lengthFeet: Math.floor(totalInches / 12),
                          lengthInches: totalInches % 12,
                        })
                      }}
                      onFocus={(e) => {
                        requestAnimationFrame(() => {
                          e.target.select()
                        })
                      }}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`width-${piece.id}`}>Width (inches)</Label>
                    <Input
                      className="text-xl"
                      id={`width-${piece.id}`}
                      type="number"
                      value={piece.width || ''}
                      onChange={(e) => {
                        const totalInches = parseInt(e.target.value) || 0
                        updatePiece(piece.id, {
                          width: totalInches,
                          widthFeet: Math.floor(totalInches / 12),
                          widthInches: totalInches % 12,
                        })
                      }}
                      onFocus={(e) => {
                        requestAnimationFrame(() => {
                          e.target.select()
                        })
                      }}
                      min="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 grid md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4">
                  <div>
                    <Label className="text-sm mb-2 block">Length</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Input
                          className="text-xl"
                          id={`lengthFeet-${piece.id}`}
                          type="number"
                          inputMode="numeric"
                          value={piece.lengthFeet || ''}
                          onChange={(e) => {
                            const feet = parseInt(e.target.value) || 0
                            updatePiece(piece.id, {
                              lengthFeet: feet,
                              length: feet * 12 + (piece.lengthInches || 0),
                            })
                          }}
                          onFocus={(e) => {
                            requestAnimationFrame(() => {
                              e.target.select()
                            })
                          }}
                          min="0"
                        />
                        <Label
                          htmlFor={`lengthFeet-${piece.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Feet
                        </Label>
                      </div>
                      <div className="space-y-1">
                        <Input
                          className="text-xl"
                          id={`lengthInches-${piece.id}`}
                          type="number"
                          inputMode="numeric"
                          value={piece.lengthInches || ''}
                          onChange={(e) => {
                            let inches = parseInt(e.target.value) || 0
                            inches = Math.max(0, Math.min(11, inches))
                            updatePiece(piece.id, {
                              lengthInches: inches,
                              length: (piece.lengthFeet || 0) * 12 + inches,
                            })
                          }}
                          onFocus={(e) => {
                            requestAnimationFrame(() => {
                              e.target.select()
                            })
                          }}
                          min="0"
                          max="11"
                        />
                        <Label
                          htmlFor={`lengthInches-${piece.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Inches
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Width</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Input
                          className="text-xl"
                          id={`widthFeet-${piece.id}`}
                          type="number"
                          inputMode="numeric"
                          value={piece.widthFeet || ''}
                          onChange={(e) => {
                            const feet = parseInt(e.target.value) || 0
                            updatePiece(piece.id, {
                              widthFeet: feet,
                              width: feet * 12 + (piece.widthInches || 0),
                            })
                          }}
                          onFocus={(e) => {
                            requestAnimationFrame(() => {
                              e.target.select()
                            })
                          }}
                          min="0"
                        />
                        <Label
                          htmlFor={`widthFeet-${piece.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Feet
                        </Label>
                      </div>
                      <div className="space-y-1">
                        <Input
                          className="text-xl"
                          id={`widthInches-${piece.id}`}
                          type="number"
                          inputMode="numeric"
                          value={piece.widthInches || ''}
                          onChange={(e) => {
                            let inches = parseInt(e.target.value) || 0
                            inches = Math.max(0, Math.min(11, inches))
                            updatePiece(piece.id, {
                              widthInches: inches,
                              width: (piece.widthFeet || 0) * 12 + inches,
                            })
                          }}
                          onFocus={(e) => {
                            requestAnimationFrame(() => {
                              e.target.select()
                            })
                          }}
                          min="0"
                          max="11"
                        />
                        <Label
                          htmlFor={`widthInches-${piece.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Inches
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden for now - will be used later */}
              <div className="hidden px-4 pb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isUsed-${piece.id}`}
                    checked={piece.isUsed}
                    onCheckedChange={(checked) =>
                      updatePiece(piece.id, { isUsed: !!checked })
                    }
                  />
                  <Label
                    htmlFor={`isUsed-${piece.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Is used
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isFilled-${piece.id}`}
                    checked={piece.isFilled}
                    onCheckedChange={(checked) =>
                      updatePiece(piece.id, { isFilled: !!checked })
                    }
                  />
                  <Label
                    htmlFor={`isFilled-${piece.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Is filled
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default PieceManager
