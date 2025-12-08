"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

interface PerformanceChartProps {
  portfolioData?: any[];
  benchmarkData?: any[];
}

export function PerformanceChart({ portfolioData, benchmarkData }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "3M" | "YTD" | "1Y">("1Y");
  
  // Sample data - replace with real data
  const sampleData = Array.from({ length: 12 }, (_, i) => ({
    date: `M${i + 1}`,
    portfolio: 100 + Math.random() * 30 + i * 2,
    benchmark: 100 + Math.random() * 20 + i * 1.5,
  }));

  const data = portfolioData || sampleData;
  
  const portfolioReturn = ((data[data.length - 1]?.portfolio - 100) || 0).toFixed(1);
  const benchmarkReturn = ((data[data.length - 1]?.benchmark - 100) || 0).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Performance vs Market</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-positive" />
                <span className="text-sm">Portfolio</span>
                <span className="text-sm font-semibold text-positive">+{portfolioReturn}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm">S&P 500</span>
                <span className="text-sm font-semibold">+{benchmarkReturn}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {(["7D", "1M", "3M", "YTD", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="url(#benchmarkGradient)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#portfolioGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
