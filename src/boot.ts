import {
  BOOT_MISSING_CANVAS,
  BOOT_MISSING_WEBGL2,
  VIEWPORT_SELECTOR,
  WEBGL_CONTEXT_ATTRIBUTES,
} from './constants'

export class BootError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'BootError'
  }
}

export interface BootedViewport {
  canvas: HTMLCanvasElement
  gl: WebGL2RenderingContext
}

export function acquireViewport(root: ParentNode): HTMLCanvasElement {
  const node = root.querySelector(VIEWPORT_SELECTOR)
  if (!(node instanceof HTMLCanvasElement)) {
    throw new BootError(BOOT_MISSING_CANVAS)
  }
  return node
}

export function acquireWebGL2<T>(host: {
  getContext: (contextId: 'webgl2', options?: WebGLContextAttributes) => T | null
}): T {
  const gl = host.getContext('webgl2')
  if (gl === null) {
    throw new BootError(BOOT_MISSING_WEBGL2)
  }
  return gl
}

export function boot(root: ParentNode): BootedViewport {
  const canvas = acquireViewport(root)
  const context = canvas.getContext('webgl2', WEBGL_CONTEXT_ATTRIBUTES)
  if (context === null) {
    throw new BootError(BOOT_MISSING_WEBGL2)
  }
  return { canvas, gl: context }
}
