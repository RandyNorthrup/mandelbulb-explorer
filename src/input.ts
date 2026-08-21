import {
  DOLLY_PER_WHEEL_DELTA,
  KEY_DOLLY_IN,
  KEY_DOLLY_OUT,
  KEY_DOWN,
  KEY_HUD,
  KEY_ITER_DOWN,
  KEY_ITER_DOWN_ALIAS,
  KEY_ITER_UP,
  KEY_ITER_UP_ALIAS,
  KEY_LEFT,
  KEY_ORBIT_STEP,
  KEY_PALETTE,
  KEY_POWER_DOWN,
  KEY_POWER_UP,
  KEY_QUALITY,
  KEY_RESET,
  KEY_RIGHT,
  KEY_UP,
  KEY_DOLLY_STEP,
  ORBIT_RADIANS_PER_PIXEL,
} from './constants'
import { defaultExplorerState, type ExplorerState } from './explorer-state'
import { dollyBy, orbitBy } from './orbit-camera'
import {
  cyclePalette,
  cycleQuality,
  nudgeIterations,
  nudgePower,
  toggleHud,
} from './params'

export type InputCommand =
  | { type: 'orbit'; pixelsX: number; pixelsY: number }
  | { type: 'dolly'; wheelDelta: number }
  | { type: 'key-orbit'; dAzimuth: number; dElevation: number }
  | { type: 'key-dolly'; delta: number }
  | { type: 'reset' }
  | { type: 'power'; direction: 1 | -1 }
  | { type: 'iterations'; direction: 1 | -1 }
  | { type: 'palette' }
  | { type: 'quality' }
  | { type: 'hud' }

export function commandFromKey(key: string): InputCommand | null {
  switch (key.toLowerCase()) {
    case KEY_RESET: {
      return { type: 'reset' }
    }
    case KEY_POWER_DOWN: {
      return { type: 'power', direction: -1 }
    }
    case KEY_POWER_UP: {
      return { type: 'power', direction: 1 }
    }
    case KEY_ITER_DOWN:
    case KEY_ITER_DOWN_ALIAS: {
      return { type: 'iterations', direction: -1 }
    }
    case KEY_ITER_UP:
    case KEY_ITER_UP_ALIAS: {
      return { type: 'iterations', direction: 1 }
    }
    case KEY_PALETTE: {
      return { type: 'palette' }
    }
    case KEY_QUALITY: {
      return { type: 'quality' }
    }
    case KEY_HUD: {
      return { type: 'hud' }
    }
    case KEY_DOLLY_IN: {
      return { type: 'key-dolly', delta: -KEY_DOLLY_STEP }
    }
    case KEY_DOLLY_OUT: {
      return { type: 'key-dolly', delta: KEY_DOLLY_STEP }
    }
    case KEY_LEFT: {
      return { type: 'key-orbit', dAzimuth: -KEY_ORBIT_STEP, dElevation: 0 }
    }
    case KEY_RIGHT: {
      return { type: 'key-orbit', dAzimuth: KEY_ORBIT_STEP, dElevation: 0 }
    }
    case KEY_UP: {
      return { type: 'key-orbit', dAzimuth: 0, dElevation: KEY_ORBIT_STEP }
    }
    case KEY_DOWN: {
      return { type: 'key-orbit', dAzimuth: 0, dElevation: -KEY_ORBIT_STEP }
    }
    default: {
      return null
    }
  }
}

export function applyCommand(
  state: ExplorerState,
  command: InputCommand,
): ExplorerState {
  switch (command.type) {
    case 'orbit': {
      return {
        ...state,
        camera: orbitBy(
          state.camera,
          command.pixelsX * ORBIT_RADIANS_PER_PIXEL,
          command.pixelsY * ORBIT_RADIANS_PER_PIXEL,
        ),
      }
    }
    case 'dolly': {
      return {
        ...state,
        camera: dollyBy(state.camera, command.wheelDelta * DOLLY_PER_WHEEL_DELTA),
      }
    }
    case 'key-orbit': {
      return {
        ...state,
        camera: orbitBy(state.camera, command.dAzimuth, command.dElevation),
      }
    }
    case 'key-dolly': {
      return {
        ...state,
        camera: dollyBy(state.camera, command.delta),
      }
    }
    case 'reset': {
      return defaultExplorerState()
    }
    case 'power': {
      return { ...state, params: nudgePower(state.params, command.direction) }
    }
    case 'iterations': {
      return { ...state, params: nudgeIterations(state.params, command.direction) }
    }
    case 'palette': {
      return { ...state, params: cyclePalette(state.params) }
    }
    case 'quality': {
      return { ...state, params: cycleQuality(state.params) }
    }
    case 'hud': {
      return { ...state, params: toggleHud(state.params) }
    }
  }
}

export interface PreventableEvent {
  key?: string
  preventDefault: () => void
}

export function handleKeyDown(
  event: PreventableEvent,
  state: ExplorerState,
): ExplorerState | null {
  if (event.key === undefined) {
    return null
  }
  const command = commandFromKey(event.key)
  if (command === null) {
    return null
  }
  event.preventDefault()
  return applyCommand(state, command)
}

export interface WheelLikeEvent {
  deltaY: number
  preventDefault: () => void
}

export function handleWheel(
  event: WheelLikeEvent,
  state: ExplorerState,
): ExplorerState {
  event.preventDefault()
  return applyCommand(state, { type: 'dolly', wheelDelta: event.deltaY })
}
