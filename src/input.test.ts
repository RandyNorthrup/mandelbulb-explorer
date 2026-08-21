import { describe, expect, it } from 'vitest'

import { DEFAULT_DISTANCE, DEFAULT_POWER } from './constants'
import { defaultExplorerState } from './explorer-state'
import { applyCommand, commandFromKey, handleKeyDown, handleWheel } from './input'

describe('commandFromKey', () => {
  it('maps bound keys and ignores unknown keys', () => {
    expect(commandFromKey('r')).toEqual({ type: 'reset' })
    expect(commandFromKey('R')).toEqual({ type: 'reset' })
    expect(commandFromKey('[')).toEqual({ type: 'power', direction: -1 })
    expect(commandFromKey('ArrowLeft')).toMatchObject({ type: 'key-orbit' })
    expect(commandFromKey('x')).toBeNull()
  })
})

describe('handleKeyDown', () => {
  it('prevents default only for bound keys', () => {
    const prevented: string[] = []
    const start = defaultExplorerState()
    const bound = handleKeyDown(
      {
        key: 'r',
        preventDefault: () => {
          prevented.push('r')
        },
      },
      start,
    )
    const unbound = handleKeyDown(
      {
        key: 'x',
        preventDefault: () => {
          prevented.push('x')
        },
      },
      start,
    )
    expect(bound?.camera.distance).toBe(DEFAULT_DISTANCE)
    expect(unbound).toBeNull()
    expect(prevented).toEqual(['r'])
  })
})

describe('handleWheel', () => {
  it('always prevents default and dollies', () => {
    let prevented = false
    const start = defaultExplorerState()
    const next = handleWheel(
      {
        deltaY: 120,
        preventDefault: () => {
          prevented = true
        },
      },
      start,
    )
    expect(prevented).toBe(true)
    expect(next.camera.distance).not.toBe(start.camera.distance)
  })
})

describe('applyCommand', () => {
  it('resets after a camera change', () => {
    const moved = applyCommand(defaultExplorerState(), {
      type: 'orbit',
      pixelsX: 40,
      pixelsY: -10,
    })
    expect(moved.camera.azimuth).not.toBe(defaultExplorerState().camera.azimuth)
    const reset = applyCommand(moved, { type: 'reset' })
    expect(reset.camera.distance).toBe(DEFAULT_DISTANCE)
    expect(reset.params.power).toBe(DEFAULT_POWER)
  })

  it('applies every bound key command', () => {
    const start = defaultExplorerState()
    const keys = [
      '[',
      ']',
      '-',
      '=',
      'p',
      'q',
      'h',
      'i',
      'o',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      '_',
      '+',
    ]
    for (const key of keys) {
      const command = commandFromKey(key)
      expect(command, key).not.toBeNull()
      if (command !== null) {
        const next = applyCommand(start, command)
        expect(next).not.toBe(start)
      }
    }
  })
})

describe('handleKeyDown missing key', () => {
  it('ignores events without a key', () => {
    expect(
      handleKeyDown(
        {
          preventDefault: () => {
            throw new Error('should not prevent')
          },
        },
        defaultExplorerState(),
      ),
    ).toBeNull()
  })
})
