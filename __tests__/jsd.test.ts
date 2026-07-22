import { describe, it, expect } from 'vitest'
import { computeJSD, computeVerdict } from '@/lib/fingerprint/jsd'

describe('computeJSD', () => {
  it('returns 0 for identical distributions', () => {
    const dist = { '10': 5, '20': 3, '30': 2 }
    const jsd = computeJSD(dist, dist)
    expect(jsd).toBeCloseTo(0, 5)
  })

  it('returns positive value for different distributions', () => {
    const a = { '10': 10, '20': 0 }
    const b = { '10': 0, '20': 10 }
    const jsd = computeJSD(a, b)
    expect(jsd).toBeGreaterThan(0)
  })

  it('handles empty distributions', () => {
    const a = {}
    const b = { '1': 5 }
    const jsd = computeJSD(a, b)
    expect(jsd).toBe(1)
  })

  it('returns 1 when both distributions are empty', () => {
    expect(computeJSD({}, {})).toBe(1)
  })

  it('handles single-value distributions', () => {
    const a = { '42': 10 }
    const b = { '42': 10 }
    expect(computeJSD(a, b)).toBeCloseTo(0, 5)
  })

  it('produces symmetric results', () => {
    const a = { '1': 9, '2': 1 }
    const b = { '1': 1, '2': 9 }
    const jsd1 = computeJSD(a, b)
    const jsd2 = computeJSD(b, a)
    expect(jsd1).toBeCloseTo(jsd2, 5)
  })

  it('handles large distribution with many keys', () => {
    const a: Record<string, number> = {}
    const b: Record<string, number> = {}
    for (let i = 1; i <= 100; i++) {
      a[String(i)] = i
      b[String(i)] = 101 - i
    }
    const jsd = computeJSD(a, b)
    expect(jsd).toBeGreaterThan(0)
    expect(jsd).toBeLessThan(1)
  })
})

describe('computeVerdict', () => {
  it('returns pass for JSD ≤ 0.15', () => {
    expect(computeVerdict(0.05)).toBe('pass')
    expect(computeVerdict(0.15)).toBe('pass')
  })

  it('returns suspect for JSD between 0.15 and 0.3', () => {
    expect(computeVerdict(0.2)).toBe('suspect')
    expect(computeVerdict(0.25)).toBe('suspect')
  })

  it('returns fail for JSD ≥ 0.3', () => {
    expect(computeVerdict(0.3)).toBe('fail')
    expect(computeVerdict(0.5)).toBe('fail')
    expect(computeVerdict(1)).toBe('fail')
  })

  it('accepts custom thresholds', () => {
    expect(computeVerdict(0.05, 0.01, 0.1)).toBe('suspect')
    expect(computeVerdict(0.12, 0.1, 0.2)).toBe('suspect')
  })
})
