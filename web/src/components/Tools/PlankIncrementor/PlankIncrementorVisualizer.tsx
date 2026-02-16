import React from 'react'

interface Measurement {
  id: string
  isLeft: boolean
  length: string
  remainder: number
  isGood: boolean
  label: string
}

interface PlankIncrementorVisualizerProps {
  measurements: Measurement[]
  materialWidth: number
}

const BAR_HEIGHT = 8
const BAR_GAP = 1
const LEFT_COLOR = '#38bdf8' // sky-400
const RIGHT_COLOR = '#a21caf' // purple-700
const CENTER_LINE_COLOR = '#222'
const REMAINDER_GOOD = '#22c55e' // green-500
const REMAINDER_BAD = '#f59e42' // orange-400
const MATERIAL_LINE_COLOR = '#0f172a' // slate-900

const PlankIncrementorVisualizer: React.FC<PlankIncrementorVisualizerProps> = ({
  measurements,
  materialWidth,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Find max value for left and right
    const leftMax = Math.max(
      ...measurements
        .filter((m) => m.isLeft)
        .map((m) => Math.abs(parseFloat(m.length) || 0)),
      1
    )
    const rightMax = Math.max(
      ...measurements
        .filter((m) => !m.isLeft)
        .map((m) => Math.abs(parseFloat(m.length) || 0)),
      1
    )
    const barMaxWidth = 300 // px, half width for each side
    const canvasWidth = barMaxWidth * 2 + 40 // center + padding
    const canvasHeight = measurements.length * (BAR_HEIGHT + BAR_GAP) + 40

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw center line
    const centerX = barMaxWidth + 20 // offset center
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, canvasHeight)
    ctx.strokeStyle = CENTER_LINE_COLOR
    ctx.lineWidth = 2
    ctx.stroke()

    measurements.forEach((measurement, i) => {
      const value = Math.abs(parseFloat(measurement.length) || 0)
      const y = i * (BAR_HEIGHT + BAR_GAP) + 40
      if (measurement.isLeft) {
        // Draw left bar (to the left of center)
        const barLength = (value / leftMax) * barMaxWidth
        ctx.fillStyle = LEFT_COLOR
        ctx.fillRect(centerX - barLength, y, barLength, BAR_HEIGHT)
        // Draw material width lines for this bar
        if (materialWidth > 0) {
          const count = Math.floor(value / materialWidth)
          for (let j = 1; j <= count; j++) {
            const logicalX = j * materialWidth
            const lineX = centerX - (logicalX / leftMax) * barMaxWidth
            ctx.beginPath()
            ctx.moveTo(lineX, y)
            ctx.lineTo(lineX, y + BAR_HEIGHT)
            ctx.strokeStyle = MATERIAL_LINE_COLOR
            ctx.lineWidth = 1
            ctx.stroke()
          }
          // Draw remainder marker starting from last material line
          const lastMaterialLogical =
            Math.floor(value / materialWidth) * materialWidth
          const lastMaterialPixels =
            (lastMaterialLogical / leftMax) * barMaxWidth
          const remainderPixels =
            (measurement.remainder / leftMax) * barMaxWidth
          const markerWidth = Math.max(2, remainderPixels)
          ctx.fillStyle = measurement.isGood ? REMAINDER_GOOD : REMAINDER_BAD
          ctx.fillRect(
            centerX - lastMaterialPixels - markerWidth,
            y,
            markerWidth,
            BAR_HEIGHT
          )
        }
      } else {
        // Draw right bar (to the right of center)
        const barLength = (value / rightMax) * barMaxWidth
        ctx.fillStyle = RIGHT_COLOR
        ctx.fillRect(centerX, y, barLength, BAR_HEIGHT)
        // Draw material width lines for this bar
        if (materialWidth > 0) {
          const count = Math.floor(value / materialWidth)
          for (let j = 1; j <= count; j++) {
            const logicalX = j * materialWidth
            const lineX = centerX + (logicalX / rightMax) * barMaxWidth
            ctx.beginPath()
            ctx.moveTo(lineX, y)
            ctx.lineTo(lineX, y + BAR_HEIGHT)
            ctx.strokeStyle = MATERIAL_LINE_COLOR
            ctx.lineWidth = 1
            ctx.stroke()
          }
          // Draw remainder marker starting from last material line
          const lastMaterialLogical =
            Math.floor(value / materialWidth) * materialWidth
          const lastMaterialPixels =
            (lastMaterialLogical / rightMax) * barMaxWidth
          const remainderPixels =
            (measurement.remainder / rightMax) * barMaxWidth
          const markerWidth = Math.max(2, remainderPixels)
          ctx.fillStyle = measurement.isGood ? REMAINDER_GOOD : REMAINDER_BAD
          ctx.fillRect(centerX + lastMaterialPixels, y, markerWidth, BAR_HEIGHT)
        }
      }
    })
  }, [measurements, materialWidth])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: 700, height: 320, display: 'block' }}
    />
  )
}

export default PlankIncrementorVisualizer
