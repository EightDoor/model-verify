'use client'

import { useState, useCallback, useRef } from 'react'
import { ConfigForm, EndpointFormData } from '@/components/config-form'
import { ProgressPanel } from '@/components/progress-panel'
import { ResultPanel } from '@/components/result-panel'
import { ProbeResult, Phase } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const { t, locale, setLocale } = useI18n()
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<ProbeResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }, [])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    stopTimer()
    setPhase('idle')
  }, [stopTimer])

  const handleStart = useCallback(
    async (config: {
      base: EndpointFormData
      compare: EndpointFormData
      samples: number
    }) => {
      const controller = new AbortController()
      abortRef.current = controller

      setPhase('probing')
      setResult(null)
      setErrorMessage('')
      startTimer()

      try {
        const res = await fetch('/api/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base: {
              url: config.base.url,
              apiKey: config.base.apiKey,
              provider: config.base.provider,
              model: config.base.model,
            },
            compare: {
              url: config.compare.url,
              apiKey: config.compare.apiKey,
              provider: config.compare.provider,
              model: config.compare.model,
            },
            samples: config.samples,
            temperature: 1,
          }),
          signal: controller.signal,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`)
        }

        setResult(data as ProbeResult)
        setPhase('done')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setPhase('idle')
        } else {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          setErrorMessage(msg)
          setPhase('error')
        }
      } finally {
        abortRef.current = null
        stopTimer()
      }
    },
    [startTimer, stopTimer],
  )

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('app.title')}</h1>
            <p className="text-muted-foreground">
              {t('app.subtitle')}
              {' ('}
              <a
                href="https://arxiv.org/abs/2607.10252"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {t('app.ref')}
              </a>
              )
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="shrink-0"
          >
            {t('lang.switch')}
          </Button>
        </div>
      </header>

      <ConfigForm onStart={handleStart} loading={phase === 'probing'} />

      {phase === 'probing' && (
        <Button variant="outline" onClick={handleCancel} className="w-full">
          {t('button.cancel')}
        </Button>
      )}

      <ProgressPanel
        elapsed={elapsed}
        phase={phase}
        errorMessage={errorMessage}
      />

      {phase === 'done' && result && (
        <>
          <Separator />
          <section>
            <ResultPanel
              verdict={result.verdict}
              jsd={result.jsd}
              baseDistribution={result.baseDistribution}
              compareDistribution={result.compareDistribution}
              baseTotal={result.baseTotal}
              compareTotal={result.compareTotal}
              sampleCount={result.sampleCount}
              baseFailCount={result.baseFailCount}
              compareFailCount={result.compareFailCount}
              warnings={result.warnings}
            />
          </section>
        </>
      )}
    </main>
  )
}
