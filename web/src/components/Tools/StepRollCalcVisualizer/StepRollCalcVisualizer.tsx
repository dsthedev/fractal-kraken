import React, { useEffect, useRef, useState, useMemo } from 'react'

interface StepRollCalcVisaulizerProps {
  profile: number
  stepWidth: number
  steps: number
  rollWidth: number
}

const directions = [
  'left-to-right-top-down',
  // 'right-to-left-top-down',
  'left-to-right-bottom-up',
  // 'right-to-left-bottom-up',
] as const

type Direction = (typeof directions)[number]

const StepRollCalcVisaulizer: React.FC<StepRollCalcVisaulizerProps> = ({
  profile,
  stepWidth,
  steps,
  rollWidth,
}) => {
  const [direction, setDirection] = useState<Direction>(
    'left-to-right-bottom-up'
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    rollWidthInches,
    possibleColumns,
    stepsPerColumn,
    totalUsedWidth,
    leftoverWidth,
    canvasWidth,
    canvasHeight,
  } = useMemo(() => {
    const rollWidthInches = rollWidth * 12
    const possibleColumns = Math.floor(rollWidthInches / stepWidth)
    const stepsPerColumn = Math.ceil(steps / possibleColumns)

    const totalUsedWidth = possibleColumns * stepWidth
    const leftoverWidth = rollWidthInches - totalUsedWidth

    const canvasWidth = rollWidthInches
    const canvasHeight = stepsPerColumn * profile

    return {
      rollWidthInches,
      possibleColumns,
      stepsPerColumn,
      totalUsedWidth,
      leftoverWidth,
      canvasWidth,
      canvasHeight,
    }
  }, [profile, stepWidth, steps, rollWidth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawCanvas(ctx)
      }
    }
  }, [profile, stepWidth, steps, rollWidth, direction])

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    // Resize canvas
    ctx.canvas.width = canvasWidth
    ctx.canvas.height = canvasHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw columns and steps based on the direction
    let stepCounter = 0
    for (let col = 0; col < possibleColumns; col++) {
      for (let step = 0; step < stepsPerColumn; step++) {
        let x, y
        switch (direction) {
          case 'right-to-left-bottom-up':
            x = (possibleColumns - 1 - col) * stepWidth
            y = (stepsPerColumn - 1 - step) * profile
            break
          case 'left-to-right-bottom-up':
            x = col * stepWidth
            y = (stepsPerColumn - 1 - step) * profile
            break
          case 'right-to-left-top-down':
            x = (possibleColumns - 1 - col) * stepWidth
            y = step * profile
            break
          case 'left-to-right-top-down':
          default:
            x = col * stepWidth
            y = step * profile
            break
        }
        ctx.fillStyle = stepCounter < steps ? 'grey' : 'lightgray'
        ctx.fillRect(x, y, stepWidth, profile)
        ctx.strokeRect(x, y, stepWidth, profile) // Optional: add border to each step
        stepCounter++
      }
    }

    // Draw leftover box
    if (leftoverWidth > 0) {
      const leftoverX = totalUsedWidth
      ctx.fillStyle = 'lightgray'
      ctx.fillRect(leftoverX, 0, leftoverWidth, canvasHeight)
      ctx.strokeRect(leftoverX, 0, leftoverWidth, canvasHeight) // Optional: add border to leftover box
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} />
      <br />
      <select
        value={direction}
        onChange={(e) => setDirection(e.target.value as Direction)}
      >
        {directions.map((dir) => (
          <option key={dir} value={dir}>
            {dir.replace(/-/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  )
}

export default StepRollCalcVisaulizer
