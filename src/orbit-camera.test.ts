import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DISTANCE,
  ELEVATION_LIMIT,
  MAX_DISTANCE,
  MIN_DISTANCE,
} from './constants'
import { cameraBasis, clampOrbit, defaultOrbit, dollyBy, orbitBy } from './orbit-camera'
import { length } from './vec3'

describe('orbit camera', () => {
  it('clamps elevation off the poles', () => {
    const high = clampOrbit({ ...defaultOrbit(), elevation: 8 })
    const low = clampOrbit({ ...defaultOrbit(), elevation: -8 })
    expect(high.elevation).toBe(ELEVATION_LIMIT)
    expect(low.elevation).toBe(-ELEVATION_LIMIT)
  })

  it('clamps distance to the named range', () => {
    expect(dollyBy(defaultOrbit(), 100).distance).toBe(MAX_DISTANCE)
    expect(dollyBy(defaultOrbit(), -100).distance).toBe(MIN_DISTANCE)
  })

  it('orbits azimuth without mutating the original state', () => {
    const start = defaultOrbit()
    const next = orbitBy(start, 0.2, 0)
    expect(start.azimuth).toBe(defaultOrbit().azimuth)
    expect(next.azimuth).toBe(start.azimuth + 0.2)
  })

  it('builds an orthonormal-ish camera basis looking at the origin', () => {
    const basis = cameraBasis({
      ...defaultOrbit(),
      azimuth: 0,
      elevation: 0,
      distance: DEFAULT_DISTANCE,
    })
    expect(basis.position.z).toBeCloseTo(DEFAULT_DISTANCE)
    expect(length(basis.forward)).toBeCloseTo(1)
    expect(length(basis.right)).toBeCloseTo(1)
    expect(length(basis.up)).toBeCloseTo(1)
  })
})
