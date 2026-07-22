'use client'

import { Verdict } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DistributionChart } from './distribution-chart'
import { Distribution } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

interface ResultPanelProps {
  verdict: Verdict
  jsd: number
  baseDistribution: Distribution
  compareDistribution: Distribution
  baseTotal: number
  compareTotal: number
  sampleCount: number
  baseFailCount: number
  compareFailCount: number
  warnings: string[]
}

export function ResultPanel({
  verdict,
  jsd,
  baseDistribution,
  compareDistribution,
  baseTotal,
  compareTotal,
  sampleCount,
  baseFailCount,
  compareFailCount,
  warnings,
}: ResultPanelProps) {
  const { t } = useI18n()

  const verdictConfig: Record<Verdict, { labelKey: string; color: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    pass: { labelKey: 'verdict.pass', color: 'text-green-600', variant: 'default' },
    suspect: { labelKey: 'verdict.suspect', color: 'text-amber-600', variant: 'secondary' },
    fail: { labelKey: 'verdict.fail', color: 'text-red-600', variant: 'destructive' },
  }

  const config = verdictConfig[verdict]

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <Card className="border-amber-500">
          <CardContent className="pt-4">
            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className={verdict === 'pass' ? 'border-green-500' : verdict === 'fail' ? 'border-red-500' : 'border-amber-500'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('result.title')}</CardTitle>
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {t(config.labelKey)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${config.color}`}>
                {jsd.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t('result.jsd')}</div>
            </div>
            <Separator orientation="vertical" className="h-16 max-sm:hidden" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t('result.hint')}</p>
              <p>{t('result.threshold')}</p>
              <p>{t('result.samples', { n: sampleCount })}</p>
              <p>{t('result.baselineValid', { baseValid: baseTotal, total: sampleCount, baseFail: baseFailCount })}</p>
              <p>{t('result.targetValid', { compareValid: compareTotal, total: sampleCount, compareFail: compareFailCount })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DistributionChart
        baseDistribution={baseDistribution}
        compareDistribution={compareDistribution}
        baseTotal={baseTotal}
        compareTotal={compareTotal}
      />
    </div>
  )
}
