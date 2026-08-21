import { MIN_DRAWING_BUFFER } from './constants'

export interface DrawingBufferSize {
  width: number
  height: number
}

export function drawingBufferSize(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  qualityScale: number,
): DrawingBufferSize {
  const scale = devicePixelRatio * qualityScale
  return {
    width: Math.max(MIN_DRAWING_BUFFER, Math.floor(cssWidth * scale)),
    height: Math.max(MIN_DRAWING_BUFFER, Math.floor(cssHeight * scale)),
  }
}
