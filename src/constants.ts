export const VIEWPORT_SELECTOR = '#viewport'
export const ERROR_SELECTOR = '#error'
export const HUD_SELECTOR = '#hud'
export const HUD_VALUES_SELECTOR = '#hud-values'
export const HUD_HELP_SELECTOR = '#hud-help'
export const HUD_FPS_SELECTOR = '#hud-fps'

export const BOOT_MISSING_CANVAS =
  'Required canvas #viewport was not found or is not a canvas element.'

export const BOOT_MISSING_WEBGL2 =
  'WebGL2 is required for this explorer and is not available in this browser.'

export const UNKNOWN_BOOT_FAILURE = 'Unknown boot failure.'

export const WEBGL_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'high-performance',
}

export const DEFAULT_AZIMUTH = 0.62
export const DEFAULT_ELEVATION = 0.34
export const DEFAULT_DISTANCE = 3.1
export const MIN_DISTANCE = 0.85
export const MAX_DISTANCE = 10
export const ELEVATION_LIMIT = Math.PI / 2 - 0.08

export const WORLD_UP_X = 0
export const WORLD_UP_Y = 1
export const WORLD_UP_Z = 0

export const DEFAULT_POWER = 8
export const MIN_POWER = 2
export const MAX_POWER = 12
export const POWER_STEP = 0.25

export const DEFAULT_ITERATIONS = 8
export const MIN_ITERATIONS = 4
export const MAX_ITERATIONS = 16
export const ITERATION_STEP = 1

export const FOV_Y_RADIANS = 0.85
export const HIT_EPSILON = 0.0006
export const MAX_MARCH_DISTANCE = 20
export const EXPOSURE = 1.35
export const LIGHT_DIR_X = 0.45
export const LIGHT_DIR_Y = 0.75
export const LIGHT_DIR_Z = 0.4

export const ORBIT_RADIANS_PER_PIXEL = 0.005
export const DOLLY_PER_WHEEL_DELTA = 0.0018
export const KEY_ORBIT_STEP = 0.06
export const KEY_DOLLY_STEP = 0.12
export const PINCH_DOLLY_SCALE = 0.01

export const QUALITY_ORDER = ['low', 'medium', 'high'] as const
export type QualityName = (typeof QUALITY_ORDER)[number]

export const QUALITY: Record<QualityName, { pixelScale: number; maxSteps: number }> = {
  low: { pixelScale: 0.5, maxSteps: 64 },
  medium: { pixelScale: 0.75, maxSteps: 96 },
  high: { pixelScale: 1, maxSteps: 128 },
}

export const DEFAULT_QUALITY: QualityName = 'medium'
export const MAX_DEVICE_PIXEL_RATIO = 2
export const MIN_DRAWING_BUFFER = 1

export const PALETTE_ORDER = ['ember', 'aurora', 'ice', 'toxic', 'mono'] as const
export type PaletteName = (typeof PALETTE_ORDER)[number]

export interface CosinePalette {
  a: readonly [number, number, number]
  b: readonly [number, number, number]
  c: readonly [number, number, number]
  d: readonly [number, number, number]
}

export const PALETTES: Record<PaletteName, CosinePalette> = {
  ember: {
    a: [0.5, 0.2, 0.08],
    b: [0.5, 0.25, 0.08],
    c: [1, 0.7, 0.4],
    d: [0, 0.15, 0.2],
  },
  aurora: {
    a: [0.12, 0.28, 0.38],
    b: [0.32, 0.5, 0.38],
    c: [1, 0.8, 0.55],
    d: [0.2, 0.35, 0.55],
  },
  ice: {
    a: [0.18, 0.32, 0.52],
    b: [0.28, 0.34, 0.4],
    c: [0.8, 0.9, 1],
    d: [0.1, 0.2, 0.4],
  },
  toxic: {
    a: [0.18, 0.38, 0.12],
    b: [0.4, 0.48, 0.22],
    c: [0.75, 1, 0.55],
    d: [0.3, 0.15, 0.55],
  },
  mono: {
    a: [0.38, 0.38, 0.38],
    b: [0.38, 0.38, 0.38],
    c: [1, 1, 1],
    d: [0, 0, 0.18],
  },
}

export const DEFAULT_PALETTE: PaletteName = 'ember'

export const FPS_SMOOTHING = 0.12
export const MILLISECONDS_PER_SECOND = 1000
export const POWER_DISPLAY_FRACTION_DIGITS = 2
export const DISTANCE_DISPLAY_FRACTION_DIGITS = 2

export const HUD_HELP_TEXT =
  'drag orbit · wheel zoom · R reset · [ ] power · - = iterations · P palette · Q quality · arrows orbit · I O zoom · H hud'

export const KEY_RESET = 'r'
export const KEY_POWER_DOWN = '['
export const KEY_POWER_UP = ']'
export const KEY_ITER_DOWN = '-'
export const KEY_ITER_DOWN_ALIAS = '_'
export const KEY_ITER_UP = '='
export const KEY_ITER_UP_ALIAS = '+'
export const KEY_PALETTE = 'p'
export const KEY_QUALITY = 'q'
export const KEY_HUD = 'h'
export const KEY_DOLLY_IN = 'i'
export const KEY_DOLLY_OUT = 'o'
export const KEY_LEFT = 'arrowleft'
export const KEY_RIGHT = 'arrowright'
export const KEY_UP = 'arrowup'
export const KEY_DOWN = 'arrowdown'
