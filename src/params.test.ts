import { describe, expect, it } from 'vitest'

import {
  MAX_ITERATIONS,
  MAX_POWER,
  MIN_ITERATIONS,
  MIN_POWER,
  PALETTE_ORDER,
  QUALITY_ORDER,
} from './constants'
import {
  cyclePalette,
  cycleQuality,
  defaultParams,
  nextCyclic,
  nudgeIterations,
  nudgePower,
  toggleHud,
} from './params'

describe('params', () => {
  it('clamps power and iterations at the named bounds', () => {
    let params = defaultParams()
    for (let step = 0; step < 80; step += 1) {
      params = nudgePower(params, 1)
    }
    expect(params.power).toBe(MAX_POWER)
    params = defaultParams()
    for (let step = 0; step < 80; step += 1) {
      params = nudgePower(params, -1)
    }
    expect(params.power).toBe(MIN_POWER)
    expect(nudgeIterations(defaultParams(), 1).iterations).toBeGreaterThan(
      defaultParams().iterations,
    )
    let iters = defaultParams()
    for (let step = 0; step < 40; step += 1) {
      iters = nudgeIterations(iters, 1)
    }
    expect(iters.iterations).toBe(MAX_ITERATIONS)
    iters = defaultParams()
    for (let step = 0; step < 40; step += 1) {
      iters = nudgeIterations(iters, -1)
    }
    expect(iters.iterations).toBe(MIN_ITERATIONS)
  })

  it('cycles palettes and wraps', () => {
    let params = defaultParams()
    const seen = new Set<string>()
    for (const _palette of PALETTE_ORDER) {
      params = cyclePalette(params)
      seen.add(params.palette)
    }
    expect(seen.size).toBe(PALETTE_ORDER.length)
    expect(params.palette).toBe(defaultParams().palette)
  })

  it('cycles quality and wraps', () => {
    let params = defaultParams()
    const seen = new Set<string>()
    for (const _quality of QUALITY_ORDER) {
      params = cycleQuality(params)
      seen.add(params.quality)
    }
    expect(seen.size).toBe(QUALITY_ORDER.length)
    expect(params.quality).toBe(defaultParams().quality)
  })

  it('toggles the HUD', () => {
    const hidden = toggleHud(defaultParams())
    expect(hidden.hudVisible).toBe(false)
    expect(toggleHud(hidden).hudVisible).toBe(true)
  })

  it('rejects empty and unknown cyclic lists', () => {
    expect(() => nextCyclic([], 'ember', 'palette')).toThrow('list is empty')
    expect(() => nextCyclic(['ember'], 'nope', 'palette')).toThrow('Unknown palette')
    const holey: string[] = ['ember']
    holey.length = 2
    expect(() => nextCyclic(holey, 'ember', 'palette')).toThrow('list is empty')
  })
})
