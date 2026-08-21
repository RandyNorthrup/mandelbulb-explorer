import { describe, expect, it } from 'vitest'

import {
  BOOT_MISSING_CANVAS,
  BOOT_MISSING_WEBGL2,
  UNKNOWN_BOOT_FAILURE,
} from './constants'
import { BootError, acquireViewport, acquireWebGL2, boot } from './boot'
import { formatUnknownError, revealErrorOverlay } from './error-overlay'

function documentWith(...nodes: HTMLElement[]): Document {
  const root = document.implementation.createHTMLDocument('fixture')
  for (const node of nodes) {
    root.body.append(node)
  }
  return root
}

describe('acquireViewport', () => {
  it('throws when the canvas is missing', () => {
    const root = documentWith()
    expect(() => acquireViewport(root)).toThrow(BootError)
    expect(() => acquireViewport(root)).toThrow(BOOT_MISSING_CANVAS)
  })

  it('throws when #viewport is not a canvas', () => {
    const decoy = document.createElement('div')
    decoy.id = 'viewport'
    expect(() => acquireViewport(documentWith(decoy))).toThrow(BOOT_MISSING_CANVAS)
  })

  it('returns the canvas element', () => {
    const canvas = document.createElement('canvas')
    canvas.id = 'viewport'
    expect(acquireViewport(documentWith(canvas))).toBe(canvas)
  })
})

describe('acquireWebGL2', () => {
  it('throws when getContext returns null', () => {
    expect(() => acquireWebGL2({ getContext: () => null })).toThrow(BOOT_MISSING_WEBGL2)
  })

  it('returns the context object when present', () => {
    const fake = { kind: 'gl' as const }
    expect(acquireWebGL2({ getContext: () => fake })).toBe(fake)
  })
})

describe('boot', () => {
  it('throws when WebGL2 is unavailable', () => {
    const canvas = document.createElement('canvas')
    canvas.id = 'viewport'
    expect(() => boot(documentWith(canvas))).toThrow(BOOT_MISSING_WEBGL2)
  })
})

describe('formatUnknownError', () => {
  it('uses an Error message', () => {
    expect(formatUnknownError(new Error('boom'))).toBe('boom')
  })

  it('uses the named fallback for non-errors', () => {
    expect(formatUnknownError('nope')).toBe(UNKNOWN_BOOT_FAILURE)
  })
})

describe('revealErrorOverlay', () => {
  it('shows the overlay text and unhides it', () => {
    const overlay = document.createElement('div')
    overlay.id = 'error'
    overlay.hidden = true
    revealErrorOverlay(documentWith(overlay), 'failed')
    expect(overlay.hidden).toBe(false)
    expect(overlay.textContent).toBe('failed')
  })

  it('throws when the overlay is missing', () => {
    expect(() => {
      revealErrorOverlay(documentWith(), 'failed')
    }).toThrow(BootError)
  })
})
