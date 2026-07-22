export const PROBE_PROMPTS = [
  'Name a random number between 1 and 100. Answer with only the number.',
  'Pick a random number from 1 to 100. Output just the number.',
  'Choose a random integer between 1 and 100. Reply with only that number.',
  'Select a random number between 1 and 100. Response with the number only.',
  'Generate a random number from 1 to 100. Only return the number.',
]

export interface PromptConfig {
  prompt: string
}

export function getProbePrompt(index: number): PromptConfig {
  const prompt = PROBE_PROMPTS[index % PROBE_PROMPTS.length]
  return { prompt }
}

export function extractNumber(text: string): number | null {
  const match = text.match(/\d+/)
  if (!match) return null
  const num = parseInt(match[0], 10)
  if (num >= 1 && num <= 100) return num
  return null
}
