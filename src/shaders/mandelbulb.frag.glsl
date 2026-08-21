#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uPower;
uniform int uIterations;
uniform int uMaxSteps;
uniform float uMaxDist;
uniform float uEpsilon;
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;
uniform vec3 uLightDir;
uniform float uExposure;

out vec4 fragColor;

const int LOOP_CAP = 32;
const float ESCAPE_RADIUS = 2.0;
const float PI2 = 6.28318530718;
const float AO_STRENGTH = 0.35;
const float GLOW_STRENGTH = 0.55;
const float AMBIENT = 0.16;
const float GAMMA = 2.2;
const float NORMAL_OFFSET = 0.0012;

float mandelbulbDistance(vec3 position, out float trap) {
  vec3 z = position;
  float dr = 1.0;
  float radius = 0.0;
  trap = ESCAPE_RADIUS;
  for (int i = 0; i < LOOP_CAP; i++) {
    if (i >= uIterations) {
      break;
    }
    radius = length(z);
    if (radius > ESCAPE_RADIUS) {
      break;
    }
    float theta = acos(clamp(z.z / radius, -1.0, 1.0));
    float phi = atan(z.y, z.x);
    float rPow = pow(radius, uPower - 1.0);
    dr = rPow * uPower * dr + 1.0;
    float zr = rPow * radius;
    theta *= uPower;
    phi *= uPower;
    z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
    z += position;
    trap = min(trap, radius);
  }
  return 0.5 * log(radius) * radius / max(dr, 1e-6);
}

vec3 estimateNormal(vec3 position) {
  vec2 e = vec2(NORMAL_OFFSET, 0.0);
  float unused;
  return normalize(
    vec3(
      mandelbulbDistance(position + e.xyy, unused) - mandelbulbDistance(position - e.xyy, unused),
      mandelbulbDistance(position + e.yxy, unused) - mandelbulbDistance(position - e.yxy, unused),
      mandelbulbDistance(position + e.yyx, unused) - mandelbulbDistance(position - e.yyx, unused)
    )
  );
}

vec3 cosinePalette(float t) {
  return uPaletteA + uPaletteB * cos(PI2 * (uPaletteC * t + uPaletteD));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  float halfHeight = tan(uFovY * 0.5);
  vec3 rayDir = normalize(
    uCameraForward + uv.x * halfHeight * uCameraRight + uv.y * halfHeight * uCameraUp
  );

  float traveled = 0.0;
  float minDistance = 1000.0;
  float trap = ESCAPE_RADIUS;
  vec3 hit = uCameraPos;
  bool found = false;

  for (int stepIndex = 0; stepIndex < 256; stepIndex++) {
    if (stepIndex >= uMaxSteps) {
      break;
    }
    hit = uCameraPos + rayDir * traveled;
    float distanceToSurface = mandelbulbDistance(hit, trap);
    minDistance = min(minDistance, distanceToSurface);
    if (distanceToSurface < uEpsilon) {
      found = true;
      break;
    }
    traveled += distanceToSurface;
    if (traveled > uMaxDist) {
      break;
    }
  }

  vec3 color;
  if (found) {
    vec3 normal = estimateNormal(hit);
    float diffuse = max(dot(normal, uLightDir), 0.0);
    float ao = clamp(1.0 - AO_STRENGTH / (trap + 0.15), 0.0, 1.0);
    vec3 albedo = cosinePalette(trap);
    color = albedo * (AMBIENT + (1.0 - AMBIENT) * diffuse) * ao;
    float fog = clamp(traveled / uMaxDist, 0.0, 1.0);
    color = mix(color, vec3(0.015, 0.016, 0.03), fog * fog);
  } else {
    float glow = exp(-minDistance * 12.0) * GLOW_STRENGTH;
    vec3 background = vec3(0.015, 0.016, 0.03);
    color = background + cosinePalette(0.15) * glow;
  }

  color *= uExposure;
  color = 1.0 - exp(-color);
  color = pow(max(color, vec3(0.0)), vec3(1.0 / GAMMA));
  fragColor = vec4(color, 1.0);
}
