"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface KeyMetricsProps {
  metrics?: {
    sharpeRatio?: number;
    volatility?: number;
    maxDrawdown?: number;
    winRate?: number;
    avgReturn?: number;
    totalTrades?: number;
  };
}

export function KeyMetrics({ metrics }: KeyMetricsProps) {
  const data = metrics || {
    sharpeRatio: 1.85,
    volatility: 18.5,
    maxDrawdown: -12.3,
    winRate: 62.5,
    avgReturn: 2.8,
    totalTrades: 24,
  };

  const metricCards = [
    {
      label: "Sharpe Ratio",
      value: data.sharpeRatio?.toFixed(2) || "0.00",
      description: "Risk-adjusted returns",
      status: (data.sharpeRatio || 0) > 1.5 ? "good" : (data.sharpeRatio || 0) > 1 ? "fair" : "poor",
      icon: (data.sharpeRatio || 0) > 1.5 ? CheckCircle2 : (data.sharpeRatio || 0) > 1 ? Info : AlertTriangle,
    },
    {
      label: "Volatility",
      value: `${data.volatility?.toFixed(1) || "0.0"}%`,
      description: "Portfolio risk level",
      status: (data.volatility || 0) < 20 ? "good" : (data.volatility || 0) < 30 ? "fair" : "poor",
      icon: (data.volatility || 0) < 20 ? CheckCircle2 : (data.volatility || 0) < 30 ? Info : AlertTriangle,
    },
    {
      label: "Max Drawdown",
      value: `${data.maxDrawdown?.toFixed(1) || "0.0"}%`,
      description: "Largest peak-to-trough decline",
      status: (data.maxDrawdown || 0) > -15 ? "good" : (data.maxDrawdown || 0) > -25 ? "fair" : "poor",
      icon: (data.maxDrawdown || 0) > -15 ? CheckCircle2 : (data.maxDrawdown || 0) > -25 ? Info : AlertTriangle,
    },
    {
      label: "Win Rate",
      value: `${data.winRate?.toFixed(1) || "0.0"}%`,
      description: "Percentage of profitable trades",
      status: (data.winRate || 0) > 60 ? "good" : (data.winRate || 0) > 50 ? "fair" : "poor",
      icon: (data.winRate || 0) > 60 ? CheckCircle2 : (data.winRate || 0) > 50 ? Info : AlertTriangle,
    },
    {
      label: "Avg Return",
      value: `${data.avgReturn && data.avgReturn > 0 ? "+" : ""}${data.avgReturn?.toFixed(1) || "0.0"}%`,
      description: "Average return per trade",
      status: (data.avgReturn || 0) > 2 ? "good" : (data.avgReturn || 0) > 0 ? "fair" : "poor",
      icon: (data.avgReturn || 0) > 2 ? TrendingUp : (data.avgReturn || 0) > 0 ? Info : TrendingDown,
    },
    {
      label: "Total Trades",
      value: data.totalTrades?.toString() || "0",
      description: "Number of executed trades",
      status: "neutral",
      icon: Info,
    },
  ];

  const statusColors = {
    good: "text-positive border-positive/30 bg-positive/5",
    fair: "text-blue-500 border-blue-500/30 bg-blue-500/5",
    poor: "text-negative border-negative/30 bg-negative/5",
    neutral: "text-muted-foreground border-border bg-muted/5",
  };

  const iconColors = {
    good: "text-positive",
    fair: "text-blue-500",
    poor: "text-negative",
    neutral: "text-muted-foreground",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Key Metrics</CardTitle>
        <p className="text-xs text-muted-foreground">Performance indicators for your portfolio</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            const statusColor = statusColors[metric.status as keyof typeof statusColors];
            const iconColor = iconColors[metric.status as keyof typeof iconColors];
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${statusColor}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium opacity-70">{metric.label}</p>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="text-2xl font-bold mb-1">{metric.value}</p>
                <p className="text-xs opacity-60">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
