import { describe, expect, it } from 'vitest'

import { HUD_HELP_TEXT } from './constants'
import { defaultExplorerState } from './explorer-state'
import { acquireHud, canvasLabel, renderHud, valuesText } from './hud'

function hudDocument(): Document {
  const root = document.implementation.createHTMLDocument('hud')
  const canvas = root.createElement('canvas')
  canvas.id = 'viewport'
  const hud = root.createElement('aside')
  hud.id = 'hud'
  const values = root.createElement('p')
  values.id = 'hud-values'
  const help = root.createElement('p')
  help.id = 'hud-help'
  const fps = root.createElement('p')
  fps.id = 'hud-fps'
  hud.append(values, help, fps)
  root.body.append(canvas, hud)
  return root
}

describe('hud', () => {
  it('fills help text on acquire', () => {
    const hud = acquireHud(hudDocument())
    expect(hud.help.textContent).toBe(HUD_HELP_TEXT)
  })

  it('throws when markup is missing', () => {
    const empty = document.implementation.createHTMLDocument('empty')
    expect(() => acquireHud(empty)).toThrow('HUD markup is missing')
  })

  it('renders values, fps, label, and hidden state', () => {
    const root = hudDocument()
    const hud = acquireHud(root)
    const state = defaultExplorerState()
    renderHud(hud, state, 60)
    expect(hud.values.textContent).toBe(valuesText(state))
    expect(hud.fps.textContent).toBe('60 fps')
    expect(hud.canvas.getAttribute('aria-label')).toBe(canvasLabel(state))
    expect(hud.root.hidden).toBe(false)
    renderHud(hud, { ...state, params: { ...state.params, hudVisible: false } }, 12.4)
    expect(hud.root.hidden).toBe(true)
    expect(hud.fps.textContent).toBe('12 fps')
  })
})
