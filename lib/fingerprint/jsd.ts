import { Distribution } from '@/lib/types'

function klDivergence(p: number[], q: number[]): number {
  let kl = 0
  for (let i = 0; i < p.length; i++) {
    // p[i] is always > 0 due to Laplacian smoothing in computeJSD
    kl += p[i] * Math.log2(p[i] / q[i])
  }
  return kl
}

export function computeJSD(
  distA: Distribution,
  distB: Distribution,
): number {
  const allKeys = new Set([...Object.keys(distA), ...Object.keys(distB)])

  const sumA = Object.values(distA).reduce((a, b) => a + b, 0)
  const sumB = Object.values(distB).reduce((a, b) => a + b, 0)

  if (sumA === 0 || sumB === 0) return 1

  const totalKeys = allKeys.size
  const epsilon = 1e-10

  const normA: number[] = []
  const normB: number[] = []

  for (const key of allKeys) {
    normA.push(((distA[key] ?? 0) + epsilon) / (sumA + epsilon * totalKeys))
    normB.push(((distB[key] ?? 0) + epsilon) / (sumB + epsilon * totalKeys))
  }

  const m = normA.map((a, i) => (a + normB[i]) / 2)

  const klPm = klDivergence(normA, m)
  const klQm = klDivergence(normB, m)

  return (klPm + klQm) / 2
}

export function computeVerdict(
  jsd: number,
  thresholdPass = 0.15,
  thresholdFail = 0.3,
): 'pass' | 'suspect' | 'fail' {
  if (jsd <= thresholdPass) return 'pass'
  if (jsd >= thresholdFail) return 'fail'
  return 'suspect'
}
