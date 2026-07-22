export type ProviderType = 'openai' | 'anthropic'

export interface EndpointConfig {
  url: string
  apiKey: string
  provider: ProviderType
  model: string
}

export interface ProbeRequest {
  base: EndpointConfig
  compare: EndpointConfig
  prompt?: string
  samples?: number
  temperature?: number
}

export type Distribution = Record<string, number>

export type Verdict = 'pass' | 'suspect' | 'fail'

export type Phase = 'idle' | 'probing' | 'done' | 'error'

export interface ProbeResult {
  baseDistribution: Distribution
  compareDistribution: Distribution
  baseTotal: number
  compareTotal: number
  baseFailCount: number
  compareFailCount: number
  jsd: number
  verdict: Verdict
  sampleCount: number
  warnings: string[]
}

export const DEFAULT_SAMPLES = 50
export const DEFAULT_TEMPERATURE = 1
export const DEFAULT_MAX_TOKENS = 10
export const JSD_THRESHOLD_PASS = 0.15
export const JSD_THRESHOLD_FAIL = 0.3
export const BATCH_SIZE = 10
export const MIN_NUMBER = 1
export const MAX_NUMBER = 100
