import { useEffect, useRef } from 'react'

import { Piece } from 'src/components/PieceManager/PieceManager'

interface VisualizerProps {
  piece?: Piece | null
  rollWidth: number
  showPadded?: boolean
  showRollOverlay?: boolean
  areaName?: string
}

const formatFeetInches = (totalInches: number) => {
  const ft = Math.floor(totalInches / 12)
  const inch = Math.round(totalInches % 12)
  return `${ft}′${inch}″`
}

const Visualizer = ({
  piece,
  rollWidth,
  showPadded = true,
  showRollOverlay = true,
  areaName,
}: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !piece) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const margin = 20

    const pieceWidth =
      piece.width || (piece.widthFeet || 0) * 12 + (piece.widthInches || 0)
    const pieceLength =
      piece.length || (piece.lengthFeet || 0) * 12 + (piece.lengthInches || 0)
    const pad = showPadded && piece.isNet ? 4 : 0

    const drawWidth = pieceWidth + pad
    const drawLength = pieceLength + pad

    const availableW = Math.max(100, width - margin * 2)
    const availableH = Math.max(100, height - margin * 2)

    const normWidth = Math.max(drawWidth, rollWidth)
    const normLength = Math.max(drawLength, rollWidth)

    const scale = Math.min(availableW / normWidth, availableH / normLength)

    const actualRectW = drawWidth * scale
    const visualRectW = Math.max(drawWidth, rollWidth) * scale
    const rectH = drawLength * scale

    const originX = margin
    const originY = Math.max(margin, height - margin - rectH)

    if (showRollOverlay) {
      const rollW = Math.min(rollWidth * scale, availableW)
      ctx.fillStyle = 'rgba(0,0,0,0.04)'
      ctx.fillRect(originX, originY, rollW, rectH)
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(originX + rollW - 1, originY, 1, rectH)
    }

    ctx.fillStyle = '#e6edf3'
    ctx.fillRect(originX, originY, visualRectW, rectH)

    const gridSpacing = 12 * scale
    if (gridSpacing >= 3) {
      ctx.save()
      ctx.strokeStyle = 'rgba(100,100,100,0.28)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (
        let gx = originX + gridSpacing;
        gx < originX + visualRectW - 0.001;
        gx += gridSpacing
      ) {
        ctx.moveTo(gx, originY)
        ctx.lineTo(gx, originY + rectH)
      }
      for (
        let gy = originY + gridSpacing;
        gy < originY + rectH - 0.001;
        gy += gridSpacing
      ) {
        ctx.moveTo(originX, gy)
        ctx.lineTo(originX + visualRectW, gy)
      }
      ctx.stroke()
      ctx.restore()
    }

    const computedFill =
      piece.fillReqWidth ?? Math.max(0, pieceWidth - rollWidth)
    const computedExcess =
      piece.excessWidth ?? Math.max(0, rollWidth - pieceWidth)
    const rollW = rollWidth * scale
    const actualRightX = originX + actualRectW
    const visualRightX = originX + visualRectW

    ctx.save()
    ctx.globalAlpha = 0.5

    if (computedFill > 0) {
      const fillPx = Math.max(2, computedFill * scale)
      const startX = originX + rollW
      const avail = Math.max(0, actualRightX - startX)
      const drawW = Math.min(fillPx, avail)
      if (drawW > 0) {
        ctx.fillStyle = 'rgba(245,158,11,1)'
        ctx.fillRect(startX, originY, drawW, rectH)
      }
    }

    {
      const overlayAvail = Math.max(0, visualRightX - actualRightX)
      const excessPx = Math.max(2, computedExcess * scale)
      const drawW = Math.min(excessPx, overlayAvail)
      if (drawW > 0) {
        const startX = actualRightX
        ctx.fillStyle = 'rgba(34,197,94,1)'
        ctx.fillRect(startX, originY, drawW, rectH)
      }
    }

    ctx.restore()

    ctx.strokeStyle = '#97a6b3'
    ctx.lineWidth = 1
    ctx.strokeRect(originX, originY, visualRectW, rectH)

    if (pad > 0) {
      ctx.save()
      ctx.strokeStyle = 'rgba(59,130,246,0.6)'
      ctx.setLineDash([6, 4])
      const haloW = (pieceWidth + pad) * scale
      const haloH = (pieceLength + pad) * scale
      ctx.strokeRect(originX, originY, Math.max(haloW, visualRectW), haloH)
      ctx.restore()
    }

    ctx.fillStyle = '#1f2937'
    const markerSize = 12
    const mx = originX + 16
    const my = originY + rectH - 16
    ctx.beginPath()
    if (piece.napFollowsLength) {
      ctx.moveTo(mx - 3, my - markerSize)
      ctx.lineTo(mx + 3, my - markerSize)
      ctx.lineTo(mx, my - markerSize - 5)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(mx - 3, my + markerSize)
      ctx.lineTo(mx + 3, my + markerSize)
      ctx.lineTo(mx, my + markerSize + 5)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(mx - 1, my - markerSize + 2, 2, markerSize * 2 - 4)
    } else {
      ctx.moveTo(mx - markerSize, my - 3)
      ctx.lineTo(mx - markerSize, my + 3)
      ctx.lineTo(mx - markerSize - 5, my)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(mx + markerSize, my - 3)
      ctx.lineTo(mx + markerSize, my + 3)
      ctx.lineTo(mx + markerSize + 5, my)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(mx - markerSize + 2, my - 1, markerSize * 2 - 4, 2)
    }

    ctx.fillStyle = '#0f172a'
    ctx.font = '12px system-ui'
    if (areaName) {
      ctx.font = '12px system-ui'
      ctx.fillText(areaName, originX + 6, originY + 10)
      ctx.font = '13px system-ui'
      ctx.fillText(piece.name || 'Piece', originX + 6, originY + 26)
      ctx.font = '12px system-ui'
      ctx.fillText(
        `${formatFeetInches(drawLength)} × ${formatFeetInches(drawWidth)}`,
        originX + 6,
        originY + 42
      )
    } else {
      ctx.fillText(piece.name || 'Piece', originX + 6, originY + 12)
      ctx.fillText(
        `${formatFeetInches(drawLength)} × ${formatFeetInches(drawWidth)}`,
        originX + 6,
        originY + 28
      )
    }
  }, [piece, rollWidth, showPadded, showRollOverlay, areaName])

  return (
    <div className="h-64 w-full">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default Visualizer
