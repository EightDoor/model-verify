'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProviderType, DEFAULT_SAMPLES } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

export interface EndpointFormData {
  url: string
  apiKey: string
  provider: ProviderType
  model: string
}

interface ConfigFormProps {
  onStart: (config: {
    base: EndpointFormData
    compare: EndpointFormData
    samples: number
  }) => void
  loading: boolean
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function ConfigForm({ onStart, loading }: ConfigFormProps) {
  const { t } = useI18n()
  const [base, setBase] = useState<EndpointFormData>({
    url: '',
    apiKey: '',
    provider: 'openai',
    model: '',
  })
  const [compare, setCompare] = useState<EndpointFormData>({
    url: '',
    apiKey: '',
    provider: 'openai',
    model: '',
  })
  const [samples, setSamples] = useState(DEFAULT_SAMPLES)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStart({ base, compare, samples })
  }

  const baseValid = !base.url || isValidUrl(base.url)
  const compareValid = !compare.url || isValidUrl(compare.url)

  const isDisabled =
    loading ||
    !base.url ||
    !base.apiKey ||
    !base.model ||
    !compare.url ||
    !compare.apiKey ||
    !compare.model ||
    !baseValid ||
    !compareValid

  const renderEndpointSection = (
    label: string,
    sectionKey: string,
    data: EndpointFormData,
    onChange: (d: EndpointFormData) => void,
    placeholder: string,
    urlValid: boolean,
  ) => (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-provider`}>{t('config.provider')}</Label>
          <Select
            value={data.provider}
            onValueChange={(v) => onChange({ ...data, provider: (v ?? 'openai') as ProviderType })}
          >
            <SelectTrigger id={`${sectionKey}-provider`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">{t('config.provider.openai')}</SelectItem>
              <SelectItem value="anthropic">{t('config.provider.anthropic')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-url`}>{t('config.baseUrl')}</Label>
          <Input
            id={`${sectionKey}-url`}
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder={placeholder}
            className={!urlValid ? 'border-red-500' : ''}
          />
          {!urlValid && (
            <p className="text-xs text-red-500">{t('config.urlInvalid')}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-key`}>{t('config.apiKey')}</Label>
          <Input
            id={`${sectionKey}-key`}
            type="password"
            value={data.apiKey}
            onChange={(e) => onChange({ ...data, apiKey: e.target.value })}
            placeholder="sk-..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-model`}>{t('config.model')}</Label>
          <Input
            id={`${sectionKey}-model`}
            value={data.model}
            onChange={(e) => onChange({ ...data, model: e.target.value })}
            placeholder="gpt-4o / claude-sonnet-4"
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4 max-lg:flex-col">
        {renderEndpointSection(
          t('config.baseline'),
          'baseline',
          base,
          setBase,
          'https://api.openai.com',
          baseValid,
        )}
        {renderEndpointSection(
          t('config.target'),
          'target',
          compare,
          setCompare,
          'https://your-relay.com',
          compareValid,
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label>{t('config.samples', { n: samples })}</Label>
            <Slider
              value={[samples]}
              onValueChange={(value) => {
                const v = Array.isArray(value) ? value[0] : value
                setSamples(v ?? 50)
              }}
              min={10}
              max={200}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              {t('config.samples.hint', { n: samples })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isDisabled} className="w-full" size="lg">
        {loading ? t('config.submitting') : t('config.submit')}
      </Button>
    </form>
  )
}
