import {
  DEFAULT_ITERATIONS,
  DEFAULT_PALETTE,
  DEFAULT_POWER,
  DEFAULT_QUALITY,
  ITERATION_STEP,
  MAX_ITERATIONS,
  MAX_POWER,
  MIN_ITERATIONS,
  MIN_POWER,
  PALETTE_ORDER,
  POWER_STEP,
  QUALITY_ORDER,
  type PaletteName,
  type QualityName,
} from './constants'

export interface ExplorerParams {
  power: number
  iterations: number
  quality: QualityName
  palette: PaletteName
  hudVisible: boolean
}

export function defaultParams(): ExplorerParams {
  return {
    power: DEFAULT_POWER,
    iterations: DEFAULT_ITERATIONS,
    quality: DEFAULT_QUALITY,
    palette: DEFAULT_PALETTE,
    hudVisible: true,
  }
}

export function clampParams(params: ExplorerParams): ExplorerParams {
  return {
    power: Math.min(MAX_POWER, Math.max(MIN_POWER, params.power)),
    iterations: Math.min(
      MAX_ITERATIONS,
      Math.max(MIN_ITERATIONS, Math.round(params.iterations)),
    ),
    quality: params.quality,
    palette: params.palette,
    hudVisible: params.hudVisible,
  }
}

export function nudgePower(params: ExplorerParams, direction: 1 | -1): ExplorerParams {
  return clampParams({
    ...params,
    power: params.power + POWER_STEP * direction,
  })
}

export function nudgeIterations(
  params: ExplorerParams,
  direction: 1 | -1,
): ExplorerParams {
  return clampParams({
    ...params,
    iterations: params.iterations + ITERATION_STEP * direction,
  })
}

export function nextCyclic<T>(items: readonly T[], current: T, label: string): T {
  if (items.length === 0) {
    throw new Error(`${label} list is empty.`)
  }
  const index = items.indexOf(current)
  if (index === -1) {
    throw new Error(`Unknown ${label}: ${String(current)}`)
  }
  const next = items[(index + 1) % items.length]
  if (next === undefined) {
    throw new Error(`${label} list is empty.`)
  }
  return next
}

export function cyclePalette(params: ExplorerParams): ExplorerParams {
  return { ...params, palette: nextCyclic(PALETTE_ORDER, params.palette, 'palette') }
}

export function cycleQuality(params: ExplorerParams): ExplorerParams {
  return { ...params, quality: nextCyclic(QUALITY_ORDER, params.quality, 'quality') }
}

export function toggleHud(params: ExplorerParams): ExplorerParams {
  return { ...params, hudVisible: !params.hudVisible }
}
