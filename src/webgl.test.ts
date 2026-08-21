import { describe, expect, it, vi } from 'vitest'

import { ShaderError } from './shader-error'
import {
  compileShader,
  createEmptyVertexArray,
  linkProgram,
  requireUniform,
  type ProgramLinkHost,
  type ShaderCompileHost,
} from './webgl'

function compileHost(
  overrides: Partial<{
    shader: { id: string } | null
    compiled: boolean
    log: string | null
  }>,
): ShaderCompileHost {
  return {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    createShader: vi.fn(() => overrides.shader ?? null),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => overrides.compiled ?? true),
    getShaderInfoLog: vi.fn(() => overrides.log ?? null),
    deleteShader: vi.fn(),
  }
}

function linkHost(
  overrides: Partial<{
    program: { id: string } | null
    linked: boolean
    log: string | null
  }>,
): ProgramLinkHost {
  return {
    LINK_STATUS: 1,
    createProgram: vi.fn(() => overrides.program ?? null),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => overrides.linked ?? true),
    getProgramInfoLog: vi.fn(() => overrides.log ?? null),
    deleteProgram: vi.fn(),
  }
}

describe('compileShader', () => {
  it('throws when the shader object cannot be created', () => {
    expect(() =>
      compileShader(compileHost({ shader: null }), 'vertex', 'void main() {}'),
    ).toThrow(ShaderError)
  })

  it('throws with the info log when compilation fails', () => {
    expect(() =>
      compileShader(
        compileHost({
          shader: { id: 'shader' },
          compiled: false,
          log: 'undeclared identifier',
        }),
        'fragment',
        'bad',
      ),
    ).toThrow(/undeclared identifier/)
  })

  it('uses a fallback log when the driver returns null', () => {
    expect(() =>
      compileShader(
        compileHost({ shader: { id: 'shader' }, compiled: false, log: null }),
        'vertex',
        'bad',
      ),
    ).toThrow(/no info log/)
  })

  it('returns the shader when compilation succeeds', () => {
    const shader = { id: 'shader' }
    expect(
      compileShader(
        compileHost({ shader, compiled: true }),
        'vertex',
        'void main() {}',
      ),
    ).toBe(shader)
  })
})

describe('linkProgram', () => {
  it('throws when the program cannot be created', () => {
    expect(() =>
      linkProgram(linkHost({ program: null }), { id: 'vs' }, { id: 'fs' }),
    ).toThrow(ShaderError)
  })

  it('returns the program when linking succeeds', () => {
    const program = { id: 'program' }
    expect(
      linkProgram(linkHost({ program, linked: true }), { id: 'vs' }, { id: 'fs' }),
    ).toBe(program)
  })

  it('throws when linking fails', () => {
    expect(() =>
      linkProgram(
        linkHost({ program: { id: 'program' }, linked: false, log: 'link exploded' }),
        { id: 'vs' },
        { id: 'fs' },
      ),
    ).toThrow(/link exploded/)
  })

  it('uses a fallback log when program info log is null', () => {
    expect(() =>
      linkProgram(
        linkHost({ program: { id: 'program' }, linked: false, log: null }),
        { id: 'vs' },
        { id: 'fs' },
      ),
    ).toThrow(/no info log/)
  })
})

describe('createEmptyVertexArray', () => {
  it('throws when VAO allocation fails', () => {
    expect(() => createEmptyVertexArray({ createVertexArray: () => null })).toThrow(
      ShaderError,
    )
  })

  it('returns the VAO when allocation succeeds', () => {
    const vao = { id: 'vao' }
    expect(createEmptyVertexArray({ createVertexArray: () => vao })).toBe(vao)
  })
})

describe('requireUniform', () => {
  it('throws when the uniform is missing', () => {
    expect(() =>
      requireUniform({ getUniformLocation: () => null }, { id: 'p' }, 'uPower'),
    ).toThrow(/uPower/)
  })

  it('returns the location when present', () => {
    const location = { id: 'loc' }
    expect(
      requireUniform({ getUniformLocation: () => location }, { id: 'p' }, 'uPower'),
    ).toBe(location)
  })
})
