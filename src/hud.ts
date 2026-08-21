import {
  DISTANCE_DISPLAY_FRACTION_DIGITS,
  HUD_FPS_SELECTOR,
  HUD_HELP_SELECTOR,
  HUD_HELP_TEXT,
  HUD_SELECTOR,
  HUD_VALUES_SELECTOR,
  POWER_DISPLAY_FRACTION_DIGITS,
  VIEWPORT_SELECTOR,
} from './constants'
import { BootError } from './boot'
import type { ExplorerState } from './explorer-state'

export interface HudElements {
  root: HTMLElement
  values: HTMLElement
  help: HTMLElement
  fps: HTMLElement
  canvas: HTMLCanvasElement
}

export function acquireHud(root: ParentNode): HudElements {
  const hud = root.querySelector(HUD_SELECTOR)
  const values = root.querySelector(HUD_VALUES_SELECTOR)
  const help = root.querySelector(HUD_HELP_SELECTOR)
  const fps = root.querySelector(HUD_FPS_SELECTOR)
  const canvas = root.querySelector(VIEWPORT_SELECTOR)
  if (
    !(hud instanceof HTMLElement) ||
    !(values instanceof HTMLElement) ||
    !(help instanceof HTMLElement) ||
    !(fps instanceof HTMLElement) ||
    !(canvas instanceof HTMLCanvasElement)
  ) {
    throw new BootError('HUD markup is missing a required element.')
  }
  help.textContent = HUD_HELP_TEXT
  return { root: hud, values, help, fps, canvas }
}

export function valuesText(state: ExplorerState): string {
  const power = state.params.power.toFixed(POWER_DISPLAY_FRACTION_DIGITS)
  const distance = state.camera.distance.toFixed(DISTANCE_DISPLAY_FRACTION_DIGITS)
  return `power ${power}  iter ${String(state.params.iterations)}  ${state.params.quality}  ${state.params.palette}  dist ${distance}`
}

export function canvasLabel(state: ExplorerState): string {
  return `Raymarched Mandelbulb, power ${state.params.power.toFixed(POWER_DISPLAY_FRACTION_DIGITS)}, ${state.params.palette} palette`
}

export function renderHud(hud: HudElements, state: ExplorerState, fps: number): void {
  hud.root.hidden = !state.params.hudVisible
  hud.values.textContent = valuesText(state)
  hud.fps.textContent = `${String(Math.round(fps))} fps`
  hud.canvas.setAttribute('aria-label', canvasLabel(state))
}
