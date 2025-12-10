"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioChartProps {
  snapshots: Array<{
    createdAt: string;
    totalValue: number;
    holdings: number;
    cash: number;
  }>;
  startValue: number;
  currentValue: number;
}

export function PortfolioChart({ snapshots, startValue, currentValue }: PortfolioChartProps) {
  const chartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: snapshot.totalValue,
  }));

  const totalReturn = currentValue - startValue;
  const totalReturnPercent = ((currentValue - startValue) / startValue) * 100;
  const isPositive = totalReturn >= 0;

  return (
    <Card className="col-span-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real Portfolio Performance</CardTitle>
            <CardDescription>Total value over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 mt-1 ${
                isPositive ? "text-positive" : "text-negative"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-semibold">
                {isPositive ? "+" : ""}${totalReturn.toFixed(2)} ({isPositive ? "+" : ""}
                {totalReturnPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No performance data yet. Start trading to build your history!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "hsl(var(--color-positive))" : "hsl(var(--color-negative))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "hsl(var(--color-positive))" : "hsl(var(--color-negative))"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-md)",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Portfolio Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "hsl(var(--color-positive))" : "hsl(var(--color-negative))"}
                fill="url(#portfolioGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
