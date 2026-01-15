import { useEffect, useRef, useState } from 'react'

import { Input } from 'src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import { Table, TableBody, TableCell, TableRow } from 'src/components/ui/table'

export default function PythagoreanTripleScale() {
  const canvasRef = useRef(null)

  const [bInput, setBInput] = useState(4)
  const [unit, setUnit] = useState('in')

  // Scale factor based on 3/4/5
  const scale = bInput / 4

  const a = 3 * scale
  const b = bInput
  const c = 5 * scale

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Triangle layout
    const padding = 30
    const maxWidth = canvas.width - padding * 2
    const maxHeight = canvas.height - padding * 2

    // Normalize scale for drawing
    const drawScale = Math.min(maxWidth / b, maxHeight / a)

    const drawA = a * drawScale
    const drawB = b * drawScale

    // Bottom-right right angle
    const originX = canvas.width - padding
    const originY = canvas.height - padding

    ctx.beginPath()
    ctx.moveTo(originX, originY) // right angle
    ctx.lineTo(originX - drawB, originY) // b (base)
    ctx.lineTo(originX - drawB, originY - drawA) // c
    ctx.closePath()

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()

    // Labels
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#000'

    // b label (bottom, horizontal)
    ctx.fillText(
      `b = ${b.toFixed(2)} ${unit}`,
      originX - drawB / 2,
      originY + 18
    )

    // a label (left side, vertical)
    ctx.fillText(
      `a = ${a.toFixed(2)} ${unit}`,
      originX - drawB + 10,
      originY - drawA / 2
    )

    // c label (middle of hypotenuse)
    ctx.fillText(
      `c = ${c.toFixed(2)} ${unit}`,
      originX - drawB / 2 + 15,
      originY - drawA / 2 - 10
    )
  }, [a, b, c, unit])

  return (
    <div className="max-w-[420px]">
      <div className="flex gap-2 mb-3">
        <Input
          type="number"
          min="1"
          value={bInput}
          onChange={(e) => setBInput(Number(e.target.value) || 0)}
          className="flex-1 text-2xl font-bold"
          onFocus={(e) => {
            requestAnimationFrame(() => {
              e.target.select()
            })
          }}
        />
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">inches</SelectItem>
            <SelectItem value="ft">feet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <hr className="my-4" />
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold">a</TableCell>
            <TableCell className="text-2xl font-bold">
              {a.toFixed(2)} {unit}
            </TableCell>
            <TableCell className="text-muted-foreground">(short)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">b</TableCell>
            <TableCell className="text-2xl">
              {b.toFixed(2)} {unit}
            </TableCell>
            <TableCell className="text-muted-foreground">(medium)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">c</TableCell>
            <TableCell className="text-2xl font-bold">
              {c.toFixed(2)} {unit}
            </TableCell>
            <TableCell className="text-muted-foreground">(long)</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <hr className="my-4" />
      <canvas
        ref={canvasRef}
        width={360}
        height={240}
        className="border border-border rounded mb-3 w-full bg-gray-100"
      />
    </div>
  )
}
