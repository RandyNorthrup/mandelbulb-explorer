import { ShaderError } from './shader-error'

export type ShaderKind = 'vertex' | 'fragment'

export interface ShaderCompileHost {
  VERTEX_SHADER: GLenum
  FRAGMENT_SHADER: GLenum
  COMPILE_STATUS: GLenum
  createShader: (type: GLenum) => WebGLShader | null
  shaderSource: (shader: WebGLShader, source: string) => void
  compileShader: (shader: WebGLShader) => void
  getShaderParameter: (shader: WebGLShader, pname: GLenum) => unknown
  getShaderInfoLog: (shader: WebGLShader) => string | null
  deleteShader: (shader: WebGLShader | null) => void
}

export interface ProgramLinkHost {
  LINK_STATUS: GLenum
  createProgram: () => WebGLProgram | null
  attachShader: (program: WebGLProgram, shader: WebGLShader) => void
  linkProgram: (program: WebGLProgram) => void
  getProgramParameter: (program: WebGLProgram, pname: GLenum) => unknown
  getProgramInfoLog: (program: WebGLProgram) => string | null
  deleteProgram: (program: WebGLProgram | null) => void
}

export function compileShader(
  gl: ShaderCompileHost,
  kind: ShaderKind,
  source: string,
): WebGLShader {
  const type = kind === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
  const shader = gl.createShader(type)
  if (shader === null) {
    throw new ShaderError(`Failed to allocate a ${kind} shader object.`)
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    const log = gl.getShaderInfoLog(shader) ?? 'no info log'
    gl.deleteShader(shader)
    throw new ShaderError(`${kind} shader compile failed: ${log}`)
  }
  return shader
}

export function linkProgram(
  gl: ProgramLinkHost,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()
  if (program === null) {
    throw new ShaderError('Failed to allocate a shader program.')
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
    const log = gl.getProgramInfoLog(program) ?? 'no info log'
    gl.deleteProgram(program)
    throw new ShaderError(`Program link failed: ${log}`)
  }
  return program
}

export interface VertexArrayHost {
  createVertexArray: () => WebGLVertexArrayObject | null
}

export interface UniformHost {
  getUniformLocation: (
    program: WebGLProgram,
    name: string,
  ) => WebGLUniformLocation | null
}

export function createEmptyVertexArray(gl: VertexArrayHost): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()
  if (vao === null) {
    throw new ShaderError('Failed to allocate a vertex array object.')
  }
  return vao
}

export function requireUniform(
  gl: UniformHost,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name)
  if (location === null) {
    throw new ShaderError(`Required uniform ${name} is missing after linking.`)
  }
  return location
}
