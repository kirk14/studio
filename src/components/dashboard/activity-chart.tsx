"use client"

import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Mon", steps: 5500, calories: 320 },
  { day: "Tue", steps: 7200, calories: 410 },
  { day: "Wed", steps: 6800, calories: 380 },
  { day: "Thu", steps: 8100, calories: 450 },
  { day: "Fri", steps: 9500, calories: 520 },
  { day: "Sat", steps: 12300, calories: 680 },
  { day: "Sun", steps: 4500, calories: 280 },
]

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--primary))",
  },
  calories: {
    label: "Calories Burned",
    color: "hsl(var(--secondary))",
  },
}

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>
          A summary of your steps and calories burned this week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => `${value.toLocaleString()} ${name === 'steps' ? 'steps' : 'kcal'}`}
                />}
            />
            <defs>
              <linearGradient id="fillSteps" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--secondary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--secondary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="steps"
              type="natural"
              fill="url(#fillSteps)"
              stroke="hsl(var(--primary))"
              stackId="a"
            />
             <Area
              dataKey="calories"
              type="natural"
              fill="url(#fillCalories)"
              stroke="hsl(var(--secondary))"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
