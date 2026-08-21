import { defaultOrbit, type OrbitState } from './orbit-camera'
import { defaultParams, type ExplorerParams } from './params'

export interface ExplorerState {
  camera: OrbitState
  params: ExplorerParams
}

export function defaultExplorerState(): ExplorerState {
  return {
    camera: defaultOrbit(),
    params: defaultParams(),
  }
}
