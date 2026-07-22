'use client'

import { Distribution } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DistributionChartProps {
  baseDistribution: Distribution
  compareDistribution: Distribution
  baseTotal: number
  compareTotal: number
}

function prepareChartData(
  base: Distribution,
  compare: Distribution,
  baseTotal: number,
  compareTotal: number,
): Array<{
  number: string
  [baselineLabel: string]: string | number
}> {
  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.keys(compare),
  ])

  const sortedKeys = Array.from(allKeys).sort((a, b) => Number(a) - Number(b))

  return sortedKeys.map((key) => ({
    number: key,
    'Baseline': ((base[key] ?? 0) / Math.max(baseTotal, 1)) * 100,
    'Target': ((compare[key] ?? 0) / Math.max(compareTotal, 1)) * 100,
  }))
}

export function DistributionChart({
  baseDistribution,
  compareDistribution,
  baseTotal,
  compareTotal,
}: DistributionChartProps) {
  const data = prepareChartData(baseDistribution, compareDistribution, baseTotal, compareTotal)

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No valid samples collected.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribution Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4 space-y-1">
          <p>Baseline valid samples: {baseTotal}</p>
          <p>Target valid samples: {compareTotal}</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="number"
              fontSize={10}
              interval={Math.max(1, Math.floor(data.length / 20))}
              tickLine={false}
            />
            <YAxis
              fontSize={11}
              tickFormatter={(v: number) => `${v}%`}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <Legend />
            <Bar
              dataKey="Baseline"
              fill="hsl(var(--chart-1))"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Target"
              fill="hsl(var(--chart-2))"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
