import { describe, expect, it } from 'vitest'

import { add, cross, dot, length, normalize, scale, sub, vec3 } from './vec3'

describe('vec3', () => {
  it('adds, subtracts, and scales', () => {
    expect(add(vec3(1, 2, 3), vec3(4, 5, 6))).toEqual(vec3(5, 7, 9))
    expect(sub(vec3(4, 5, 6), vec3(1, 2, 3))).toEqual(vec3(3, 3, 3))
    expect(scale(vec3(1, -2, 3), 2)).toEqual(vec3(2, -4, 6))
  })

  it('computes dot, cross, and length', () => {
    expect(dot(vec3(1, 0, 0), vec3(0, 1, 0))).toBe(0)
    expect(cross(vec3(1, 0, 0), vec3(0, 1, 0))).toEqual(vec3(0, 0, 1))
    expect(length(vec3(3, 4, 0))).toBe(5)
  })

  it('normalizes a non-zero vector', () => {
    expect(normalize(vec3(0, 4, 0))).toEqual(vec3(0, 1, 0))
  })

  it('refuses to normalize a zero vector', () => {
    expect(() => normalize(vec3(0, 0, 0))).toThrow(
      'Cannot normalize a zero-length vector.',
    )
  })
})
