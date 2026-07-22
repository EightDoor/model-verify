import {
  EndpointConfig,
  Distribution,
  DEFAULT_SAMPLES,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
  BATCH_SIZE,
} from '@/lib/types'
import { getProbePrompt, extractNumber } from './prompts'
import { sendProbeRequest } from './providers'

export interface ProbeEndpointResult {
  distribution: Distribution
  successCount: number
  failCount: number
}

async function probeEndpoint(
  config: EndpointConfig,
  samples: number,
  temperature: number,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<ProbeEndpointResult> {
  const distribution: Distribution = {}
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < samples; i += BATCH_SIZE) {
    const batch = Math.min(BATCH_SIZE, samples - i)
    const indices = Array.from({ length: batch }, (_, j) => i + j)

    const results = await Promise.all(
      indices.map(async (idx) => {
        const { prompt } = getProbePrompt(idx)
        try {
          const text = await sendProbeRequest(config, prompt, temperature, maxTokens, signal)
          return extractNumber(text)
        } catch {
          return null
        }
      }),
    )

    for (const num of results) {
      if (num !== null) {
        const key = String(num)
        distribution[key] = (distribution[key] ?? 0) + 1
        successCount++
      } else {
        failCount++
      }
    }
  }

  return { distribution, successCount, failCount }
}

export async function runProbe(
  baseConfig: EndpointConfig,
  compareConfig: EndpointConfig,
  samples: number = DEFAULT_SAMPLES,
  temperature: number = DEFAULT_TEMPERATURE,
  signal?: AbortSignal,
): Promise<{
  base: ProbeEndpointResult
  compare: ProbeEndpointResult
}> {
  const [base, compare] = await Promise.all([
    probeEndpoint(baseConfig, samples, temperature, DEFAULT_MAX_TOKENS, signal),
    probeEndpoint(compareConfig, samples, temperature, DEFAULT_MAX_TOKENS, signal),
  ])

  return { base, compare }
}
