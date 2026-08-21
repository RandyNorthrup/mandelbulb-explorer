import {
  EXPOSURE,
  FOV_Y_RADIANS,
  HIT_EPSILON,
  LIGHT_DIR_X,
  LIGHT_DIR_Y,
  LIGHT_DIR_Z,
  MAX_DEVICE_PIXEL_RATIO,
  MAX_MARCH_DISTANCE,
  PALETTES,
  QUALITY,
} from './constants'
import { drawingBufferSize } from './drawing-buffer'
import { cameraBasis } from './orbit-camera'
import { length, normalize, vec3 } from './vec3'
import {
  compileShader,
  createEmptyVertexArray,
  linkProgram,
  requireUniform,
} from './webgl'
import type { ExplorerState } from './explorer-state'

const FULLSCREEN_VERTEX_COUNT = 3
const LIGHT_DIR = normalize(vec3(LIGHT_DIR_X, LIGHT_DIR_Y, LIGHT_DIR_Z))

export interface RendererUniforms {
  resolution: WebGLUniformLocation
  cameraPos: WebGLUniformLocation
  cameraRight: WebGLUniformLocation
  cameraUp: WebGLUniformLocation
  cameraForward: WebGLUniformLocation
  fovY: WebGLUniformLocation
  power: WebGLUniformLocation
  iterations: WebGLUniformLocation
  maxSteps: WebGLUniformLocation
  maxDist: WebGLUniformLocation
  epsilon: WebGLUniformLocation
  paletteA: WebGLUniformLocation
  paletteB: WebGLUniformLocation
  paletteC: WebGLUniformLocation
  paletteD: WebGLUniformLocation
  lightDir: WebGLUniformLocation
  exposure: WebGLUniformLocation
}

export function collectUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): RendererUniforms {
  return {
    resolution: requireUniform(gl, program, 'uResolution'),
    cameraPos: requireUniform(gl, program, 'uCameraPos'),
    cameraRight: requireUniform(gl, program, 'uCameraRight'),
    cameraUp: requireUniform(gl, program, 'uCameraUp'),
    cameraForward: requireUniform(gl, program, 'uCameraForward'),
    fovY: requireUniform(gl, program, 'uFovY'),
    power: requireUniform(gl, program, 'uPower'),
    iterations: requireUniform(gl, program, 'uIterations'),
    maxSteps: requireUniform(gl, program, 'uMaxSteps'),
    maxDist: requireUniform(gl, program, 'uMaxDist'),
    epsilon: requireUniform(gl, program, 'uEpsilon'),
    paletteA: requireUniform(gl, program, 'uPaletteA'),
    paletteB: requireUniform(gl, program, 'uPaletteB'),
    paletteC: requireUniform(gl, program, 'uPaletteC'),
    paletteD: requireUniform(gl, program, 'uPaletteD'),
    lightDir: requireUniform(gl, program, 'uLightDir'),
    exposure: requireUniform(gl, program, 'uExposure'),
  }
}

export class Renderer {
  private readonly gl: WebGL2RenderingContext
  private readonly canvas: HTMLCanvasElement
  private readonly program: WebGLProgram
  private readonly vao: WebGLVertexArrayObject
  private readonly uniforms: RendererUniforms

  public constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    vertexSource: string,
    fragmentSource: string,
  ) {
    this.gl = gl
    this.canvas = canvas
    const vertexShader = compileShader(gl, 'vertex', vertexSource)
    const fragmentShader = compileShader(gl, 'fragment', fragmentSource)
    this.program = linkProgram(gl, vertexShader, fragmentShader)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    this.vao = createEmptyVertexArray(gl)
    this.uniforms = collectUniforms(gl, this.program)
  }

  public resize(
    cssWidth: number,
    cssHeight: number,
    devicePixelRatio: number,
    qualityScale: number,
  ): void {
    const cappedRatio = Math.min(devicePixelRatio, MAX_DEVICE_PIXEL_RATIO)
    const size = drawingBufferSize(cssWidth, cssHeight, cappedRatio, qualityScale)
    if (this.canvas.width !== size.width || this.canvas.height !== size.height) {
      this.canvas.width = size.width
      this.canvas.height = size.height
    }
    this.gl.viewport(0, 0, size.width, size.height)
  }

  public draw(state: ExplorerState): void {
    const gl = this.gl
    const basis = cameraBasis(state.camera)
    const palette = PALETTES[state.params.palette]
    const quality = QUALITY[state.params.quality]
    const lightLength = length(LIGHT_DIR)
    if (lightLength === 0) {
      throw new Error('Light direction collapsed to zero.')
    }

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height)
    gl.uniform3f(
      this.uniforms.cameraPos,
      basis.position.x,
      basis.position.y,
      basis.position.z,
    )
    gl.uniform3f(this.uniforms.cameraRight, basis.right.x, basis.right.y, basis.right.z)
    gl.uniform3f(this.uniforms.cameraUp, basis.up.x, basis.up.y, basis.up.z)
    gl.uniform3f(
      this.uniforms.cameraForward,
      basis.forward.x,
      basis.forward.y,
      basis.forward.z,
    )
    gl.uniform1f(this.uniforms.fovY, FOV_Y_RADIANS)
    gl.uniform1f(this.uniforms.power, state.params.power)
    gl.uniform1i(this.uniforms.iterations, state.params.iterations)
    gl.uniform1i(this.uniforms.maxSteps, quality.maxSteps)
    gl.uniform1f(this.uniforms.maxDist, MAX_MARCH_DISTANCE)
    gl.uniform1f(this.uniforms.epsilon, HIT_EPSILON)
    gl.uniform3f(this.uniforms.paletteA, palette.a[0], palette.a[1], palette.a[2])
    gl.uniform3f(this.uniforms.paletteB, palette.b[0], palette.b[1], palette.b[2])
    gl.uniform3f(this.uniforms.paletteC, palette.c[0], palette.c[1], palette.c[2])
    gl.uniform3f(this.uniforms.paletteD, palette.d[0], palette.d[1], palette.d[2])
    gl.uniform3f(this.uniforms.lightDir, LIGHT_DIR.x, LIGHT_DIR.y, LIGHT_DIR.z)
    gl.uniform1f(this.uniforms.exposure, EXPOSURE)
    gl.drawArrays(gl.TRIANGLES, 0, FULLSCREEN_VERTEX_COUNT)
  }
}
