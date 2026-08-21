import { describe, expect, it } from 'vitest'

import { MIN_DRAWING_BUFFER } from './constants'
import { drawingBufferSize } from './drawing-buffer'

describe('drawingBufferSize', () => {
  it('scales css size by pixel ratio and quality', () => {
    expect(drawingBufferSize(200, 100, 2, 0.5)).toEqual({ width: 200, height: 100 })
  })

  it('never returns a zero buffer', () => {
    expect(drawingBufferSize(0.2, 0.2, 1, 0.5)).toEqual({
      width: MIN_DRAWING_BUFFER,
      height: MIN_DRAWING_BUFFER,
    })
  })
})
