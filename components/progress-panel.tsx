'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ProgressPanelProps {
  elapsed: number
  phase: 'idle' | 'probing' | 'analyzing' | 'done' | 'error'
  errorMessage?: string
}

export function ProgressPanel({ elapsed, phase, errorMessage }: ProgressPanelProps) {
  if (phase === 'idle') return null

  if (phase === 'error') {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-destructive font-medium">Error: {errorMessage}</div>
        </CardContent>
      </Card>
    )
  }

  if (phase === 'done') return null

  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          <span className="font-medium">
            {phase === 'probing' ? 'Probing endpoints...' : 'Analyzing distributions...'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Elapsed: {elapsed}s · This may take 30-60 seconds
        </p>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{
              width: phase === 'probing' ? '60%' : '90%',
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
