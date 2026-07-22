import { NextResponse } from 'next/server'
import {
  ProbeRequest,
  DEFAULT_SAMPLES,
  DEFAULT_TEMPERATURE,
  JSD_THRESHOLD_PASS,
  JSD_THRESHOLD_FAIL,
} from '@/lib/types'
import { runProbe } from '@/lib/fingerprint/probe'
import { computeJSD, computeVerdict } from '@/lib/fingerprint/jsd'

function validateEndpointUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Only HTTP/HTTPS protocols are allowed'
    }
    if (
      /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|localhost|::1|169\.254)/.test(
        parsed.hostname,
      )
    ) {
      return 'Internal/private addresses are not allowed'
    }
    return null
  } catch {
    return 'Invalid URL format'
  }
}

export async function POST(request: Request) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 55_000)

  try {
    const body: ProbeRequest = await request.json()

    if (!body.base?.url || !body.base?.apiKey || !body.base?.model) {
      return NextResponse.json(
        { error: 'Baseline endpoint config is incomplete (url, apiKey, model required)' },
        { status: 400 },
      )
    }
    if (!body.compare?.url || !body.compare?.apiKey || !body.compare?.model) {
      return NextResponse.json(
        { error: 'Target endpoint config is incomplete (url, apiKey, model required)' },
        { status: 400 },
      )
    }

    const baseUrlError = validateEndpointUrl(body.base.url)
    if (baseUrlError) {
      return NextResponse.json(
        { error: `Baseline URL: ${baseUrlError}` },
        { status: 400 },
      )
    }

    const compareUrlError = validateEndpointUrl(body.compare.url)
    if (compareUrlError) {
      return NextResponse.json(
        { error: `Target URL: ${compareUrlError}` },
        { status: 400 },
      )
    }

    const samples = body.samples ?? DEFAULT_SAMPLES
    const temperature = body.temperature ?? DEFAULT_TEMPERATURE

    if (samples < 5 || samples > 500) {
      return NextResponse.json(
        { error: 'Samples must be between 5 and 500' },
        { status: 400 },
      )
    }

    const { base, compare } = await runProbe(
      body.base,
      body.compare,
      samples,
      temperature,
      controller.signal,
    )

    const baseTotal = base.successCount
    const compareTotal = compare.successCount

    let jsd = 1
    let verdict: 'pass' | 'suspect' | 'fail' = 'fail'
    const warnings: string[] = []

    if (baseTotal > 0 && compareTotal > 0) {
      jsd = computeJSD(base.distribution, compare.distribution)
      verdict = computeVerdict(jsd, JSD_THRESHOLD_PASS, JSD_THRESHOLD_FAIL)
    } else if (baseTotal === 0 && compareTotal === 0) {
      warnings.push('Both endpoints returned zero valid samples')
    } else if (baseTotal === 0) {
      warnings.push('Baseline endpoint returned zero valid samples')
    } else if (compareTotal === 0) {
      warnings.push('Target endpoint returned zero valid samples')
    }

    const baseSuccessRate = samples > 0 ? baseTotal / samples : 0
    const compareSuccessRate = samples > 0 ? compareTotal / samples : 0

    if (baseSuccessRate < 0.5) {
      warnings.push(`Baseline success rate is low (${baseTotal}/${samples})`)
    }
    if (compareSuccessRate < 0.5) {
      warnings.push(`Target success rate is low (${compareTotal}/${samples})`)
    }

    return NextResponse.json({
      baseDistribution: base.distribution,
      compareDistribution: compare.distribution,
      baseTotal,
      compareTotal,
      baseFailCount: base.failCount,
      compareFailCount: compare.failCount,
      jsd: Math.round(jsd * 10000) / 10000,
      verdict,
      sampleCount: samples,
      warnings,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Try reducing sample count.' },
        { status: 504 },
      )
    }
    console.error('[probe]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
