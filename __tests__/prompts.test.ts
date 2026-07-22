import { describe, it, expect } from 'vitest'
import { getProbePrompt, extractNumber, PROBE_PROMPTS } from '@/lib/fingerprint/prompts'

describe('getProbePrompt', () => {
  it('returns a prompt for valid index', () => {
    const result = getProbePrompt(0)
    expect(result.prompt).toBeTruthy()
    expect(typeof result.prompt).toBe('string')
  })

  it('cycles through prompts for index >= length', () => {
    const r1 = getProbePrompt(0)
    const r2 = getProbePrompt(PROBE_PROMPTS.length)
    expect(r1.prompt).toBe(r2.prompt)
  })

  it('provides different prompts for different indices', () => {
    const r1 = getProbePrompt(0)
    const r2 = getProbePrompt(1)
    expect(r1.prompt).not.toBe(r2.prompt)
  })
})

describe('extractNumber', () => {
  it('extracts a number from simple response', () => {
    expect(extractNumber('42')).toBe(42)
  })

  it('extracts number from sentence', () => {
    expect(extractNumber('The number is 73.')).toBe(73)
  })

  it('extracts number with leading text', () => {
    expect(extractNumber('I pick 50.')).toBe(50)
  })

  it('returns null for text without numbers', () => {
    expect(extractNumber('I do not know.')).toBeNull()
  })

  it('returns null for number outside 1-100 range', () => {
    expect(extractNumber('200')).toBeNull()
    expect(extractNumber('0')).toBeNull()
  })

  it('returns the first number if multiple numbers', () => {
    expect(extractNumber('42 and 73')).toBe(42)
  })

  it('handles empty string', () => {
    expect(extractNumber('')).toBeNull()
  })
})
