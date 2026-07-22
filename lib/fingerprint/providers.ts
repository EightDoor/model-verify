import { EndpointConfig } from '@/lib/types'

interface RequestConfig {
  url: string
  headers: Record<string, string>
  body: string
}

function buildOpenAIRequest(
  config: EndpointConfig,
  prompt: string,
  temperature: number,
  maxTokens: number,
): RequestConfig {
  const baseUrl = config.url.replace(/\/+$/, '')
  return {
    url: `${baseUrl}/v1/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  }
}

function buildAnthropicRequest(
  config: EndpointConfig,
  prompt: string,
  temperature: number,
  maxTokens: number,
): RequestConfig {
  const baseUrl = config.url.replace(/\/+$/, '')
  return {
    url: `${baseUrl}/v1/messages`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  }
}

export function buildRequest(
  config: EndpointConfig,
  prompt: string,
  temperature: number,
  maxTokens: number,
): RequestConfig {
  switch (config.provider) {
    case 'openai':
      return buildOpenAIRequest(config, prompt, temperature, maxTokens)
    case 'anthropic':
      return buildAnthropicRequest(config, prompt, temperature, maxTokens)
  }
}

function parseOpenAIResponse(raw: unknown): string {
  const body = raw as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return body?.choices?.[0]?.message?.content ?? ''
}

function parseAnthropicResponse(raw: unknown): string {
  const body = raw as {
    content?: Array<{ text?: string }>
  }
  return body?.content?.[0]?.text ?? ''
}

export async function sendProbeRequest(
  config: EndpointConfig,
  prompt: string,
  temperature: number,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<string> {
  const req = buildRequest(config, prompt, temperature, maxTokens)

  const response = await fetch(req.url, {
    method: 'POST',
    headers: req.headers,
    body: req.body,
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(
      `API error (${response.status}): ${text.slice(0, 200)}`,
    )
  }

  const data: unknown = await response.json()

  switch (config.provider) {
    case 'openai':
      return parseOpenAIResponse(data)
    case 'anthropic':
      return parseAnthropicResponse(data)
  }
}
