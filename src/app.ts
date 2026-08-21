import {
  MAX_DEVICE_PIXEL_RATIO,
  MILLISECONDS_PER_SECOND,
  PINCH_DOLLY_SCALE,
  QUALITY,
  FPS_SMOOTHING,
} from './constants'
import { defaultExplorerState, type ExplorerState } from './explorer-state'
import { applyCommand, handleKeyDown, handleWheel } from './input'
import { acquireHud, renderHud, type HudElements } from './hud'
import { Renderer } from './renderer'
import fragmentSource from './shaders/mandelbulb.frag.glsl?raw'
import vertexSource from './shaders/fullscreen.vert.glsl?raw'

interface PointerSample {
  x: number
  y: number
}

export function startExplorer(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  root: ParentNode,
): () => void {
  const hud: HudElements = acquireHud(root)
  const renderer = new Renderer(gl, canvas, vertexSource, fragmentSource)
  let state: ExplorerState = defaultExplorerState()
  let fps = 0
  let lastFrameMs = performance.now()
  let frameHandle = 0
  const pointers = new Map<number, PointerSample>()
  let pinchDistance: number | null = null

  const resize = (): void => {
    const quality = QUALITY[state.params.quality]
    renderer.resize(
      canvas.clientWidth,
      canvas.clientHeight,
      Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO),
      quality.pixelScale,
    )
  }

  const frame = (now: number): void => {
    const deltaMs = now - lastFrameMs
    lastFrameMs = now
    if (deltaMs > 0) {
      const instantaneous = MILLISECONDS_PER_SECOND / deltaMs
      fps += (instantaneous - fps) * FPS_SMOOTHING
    }
    renderer.draw(state)
    renderHud(hud, state, fps)
    frameHandle = requestAnimationFrame(frame)
  }

  const onPointerDown = (event: PointerEvent): void => {
    canvas.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 2) {
      pinchDistance = currentPinchDistance(pointers)
    }
  }

  const onPointerMove = (event: PointerEvent): void => {
    const previous = pointers.get(event.pointerId)
    if (previous === undefined) {
      return
    }
    const current = { x: event.clientX, y: event.clientY }
    if (pointers.size === 1) {
      state = applyCommand(state, {
        type: 'orbit',
        pixelsX: current.x - previous.x,
        pixelsY: previous.y - current.y,
      })
    } else if (pinchDistance !== null && pointers.size === 2) {
      pointers.set(event.pointerId, current)
      const nextPinch = currentPinchDistance(pointers)
      const delta = pinchDistance - nextPinch
      state = applyCommand(state, {
        type: 'key-dolly',
        delta: delta * PINCH_DOLLY_SCALE,
      })
      pinchDistance = nextPinch
      return
    }
    pointers.set(event.pointerId, current)
  }

  const onPointerUp = (event: PointerEvent): void => {
    pointers.delete(event.pointerId)
    if (pointers.size < 2) {
      pinchDistance = null
    }
  }

  const onWheel = (event: WheelEvent): void => {
    state = handleWheel(event, state)
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    const next = handleKeyDown(event, state)
    if (next !== null) {
      state = next
      resize()
    }
  }

  const onWindowResize = (): void => {
    resize()
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', onWindowResize)

  resize()
  renderHud(hud, state, fps)
  frameHandle = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(frameHandle)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onWindowResize)
  }
}

function currentPinchDistance(pointers: Map<number, PointerSample>): number {
  const points = [...pointers.values()]
  const first = points[0]
  const second = points[1]
  if (first === undefined || second === undefined) {
    throw new Error('Pinch distance requires two pointers.')
  }
  return Math.hypot(first.x - second.x, first.y - second.y)
}
