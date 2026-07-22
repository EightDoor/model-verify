'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

type Locale = 'zh' | 'en'

const dict: Record<Locale, Record<string, string>> = {
  zh: {
    'app.title': 'Model Verify',
    'app.subtitle': '基于单 Token 随机数指纹的 LLM API 中转站模型真伪检测',
    'app.ref': 'One Token Is Enough, 2026',
    'config.baseline': '基准（官方 API）',
    'config.target': '目标（中转 API）',
    'config.provider': '提供商',
    'config.provider.openai': 'OpenAI 兼容',
    'config.provider.anthropic': 'Anthropic',
    'config.baseUrl': 'Base URL',
    'config.apiKey': 'API Key',
    'config.model': '模型',
    'config.samples': '每端采样数: {n}',
    'config.samples.hint': '越高越准确，速度越慢。每端发送 {n} 次探测请求。',
    'config.submit': '开始验证',
    'config.submitting': '验证中...',
    'config.urlInvalid': '请输入有效的 http(s) URL',
    'progress.probing': '正在探测端点...',
    'progress.analyzing': '正在分析分布...',
    'progress.elapsed': '已耗时: {n}s · 约需 30-60 秒',
    'progress.error': '错误: {msg}',
    'result.title': '验证结果',
    'result.jsd': 'Jensen-Shannon 散度',
    'result.hint': 'JSD 越小，分布越相似',
    'result.threshold': '通过: ≤0.15 | 可疑: 0.15–0.3 | 未通过: ≥0.3',
    'result.samples': '每端探测请求数: {n}',
    'result.baselineValid': '基准有效: {baseValid}/{total}（{baseFail} 次失败）',
    'result.targetValid': '目标有效: {compareValid}/{total}（{compareFail} 次失败）',
    'verdict.pass': '通过',
    'verdict.suspect': '可疑',
    'verdict.fail': '未通过',
    'chart.title': '分布对比',
    'chart.baseline': '基准',
    'chart.target': '目标',
    'chart.baselineSamples': '基准有效样本数: {n}',
    'chart.targetSamples': '目标有效样本数: {n}',
    'chart.noData': '未收集到有效样本。',
    'button.cancel': '取消',
    'lang.switch': 'EN',
  },
  en: {
    'app.title': 'Model Verify',
    'app.subtitle': 'Detect relay API model substitution using single-token random-number fingerprint',
    'app.ref': 'One Token Is Enough, 2026',
    'config.baseline': 'Baseline (Official API)',
    'config.target': 'Target (Relay API)',
    'config.provider': 'Provider',
    'config.provider.openai': 'OpenAI Compatible',
    'config.provider.anthropic': 'Anthropic',
    'config.baseUrl': 'Base URL',
    'config.apiKey': 'API Key',
    'config.model': 'Model',
    'config.samples': 'Samples per endpoint: {n}',
    'config.samples.hint': 'Higher = more accurate, slower. Each endpoint sends {n} probe requests.',
    'config.submit': 'Start Verification',
    'config.submitting': 'Verifying...',
    'config.urlInvalid': 'Enter a valid http(s) URL',
    'progress.probing': 'Probing endpoints...',
    'progress.analyzing': 'Analyzing distributions...',
    'progress.elapsed': 'Elapsed: {n}s · This may take 30-60 seconds',
    'progress.error': 'Error: {msg}',
    'result.title': 'Verification Result',
    'result.jsd': 'Jensen-Shannon Divergence',
    'result.hint': 'Lower JSD = more similar distributions',
    'result.threshold': 'Pass: ≤0.15 | Suspect: 0.15–0.3 | Fail: ≥0.3',
    'result.samples': 'Probe requests per endpoint: {n}',
    'result.baselineValid': 'Baseline valid: {baseValid}/{total} ({baseFail} failed)',
    'result.targetValid': 'Target valid: {compareValid}/{total} ({compareFail} failed)',
    'verdict.pass': 'PASS',
    'verdict.suspect': 'SUSPECT',
    'verdict.fail': 'FAIL',
    'chart.title': 'Distribution Comparison',
    'chart.baseline': 'Baseline',
    'chart.target': 'Target',
    'chart.baselineSamples': 'Baseline valid samples: {n}',
    'chart.targetSamples': 'Target valid samples: {n}',
    'chart.noData': 'No valid samples collected.',
    'button.cancel': 'Cancel',
    'lang.switch': '中',
  },
}

interface I18nContext {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nCtx = createContext<I18nContext | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved === 'en' || saved === 'zh') setLocale(saved)
  }, [])

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l)
    localStorage.setItem('locale', l)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let text = dict[locale][key]
      if (text === undefined) return key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v))
        }
      }
      return text
    },
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dataset.lang = locale
  }, [locale])

  return (
    <I18nCtx.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nCtx.Provider>
  )
}

export function useI18n(): I18nContext {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
