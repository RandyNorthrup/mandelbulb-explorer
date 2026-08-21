import {
  DEFAULT_AZIMUTH,
  DEFAULT_DISTANCE,
  DEFAULT_ELEVATION,
  ELEVATION_LIMIT,
  MAX_DISTANCE,
  MIN_DISTANCE,
  WORLD_UP_X,
  WORLD_UP_Y,
  WORLD_UP_Z,
} from './constants'
import { add, cross, normalize, sub, vec3, type Vec3 } from './vec3'

export interface OrbitState {
  azimuth: number
  elevation: number
  distance: number
  target: Vec3
}

export interface CameraBasis {
  position: Vec3
  right: Vec3
  up: Vec3
  forward: Vec3
}

const WORLD_UP = vec3(WORLD_UP_X, WORLD_UP_Y, WORLD_UP_Z)

export function defaultOrbit(): OrbitState {
  return {
    azimuth: DEFAULT_AZIMUTH,
    elevation: DEFAULT_ELEVATION,
    distance: DEFAULT_DISTANCE,
    target: vec3(0, 0, 0),
  }
}

export function clampOrbit(state: OrbitState): OrbitState {
  return {
    azimuth: state.azimuth,
    elevation: Math.min(ELEVATION_LIMIT, Math.max(-ELEVATION_LIMIT, state.elevation)),
    distance: Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, state.distance)),
    target: state.target,
  }
}

export function orbitBy(
  state: OrbitState,
  dAzimuth: number,
  dElevation: number,
): OrbitState {
  return clampOrbit({
    ...state,
    azimuth: state.azimuth + dAzimuth,
    elevation: state.elevation + dElevation,
  })
}

export function dollyBy(state: OrbitState, delta: number): OrbitState {
  return clampOrbit({
    ...state,
    distance: state.distance + delta,
  })
}

export function cameraBasis(state: OrbitState): CameraBasis {
  const clamped = clampOrbit(state)
  const cosEl = Math.cos(clamped.elevation)
  const offset = vec3(
    clamped.distance * cosEl * Math.sin(clamped.azimuth),
    clamped.distance * Math.sin(clamped.elevation),
    clamped.distance * cosEl * Math.cos(clamped.azimuth),
  )
  const position = add(clamped.target, offset)
  const forward = normalize(sub(clamped.target, position))
  const right = normalize(cross(forward, WORLD_UP))
  const up = cross(right, forward)
  return { position, right, up, forward }
}
