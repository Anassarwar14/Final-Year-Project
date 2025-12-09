"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useSWR from "swr";

interface TradingChartProps {
  symbol: string;
}

type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TradingChart({ symbol }: TradingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generate unique gradient ID for this component instance
  const gradientId = useMemo(() => `areaGradient-${symbol}-${Math.random().toString(36).substr(2, 9)}`, [symbol]);

  // Fetch real-time quote for appending to chart
  const { data: quoteData } = useSWR(
    `/api/trading/market/quote/${symbol}`,
    fetcher,
    {
      refreshInterval: 15000, // Update every 15 seconds
      revalidateOnFocus: false,
    }
  );

  // Fetch historical candles (cached, doesn't update until next day)
  useEffect(() => {
    // Debounce to prevent rapid API calls when switching time ranges
    const timeoutId = setTimeout(() => {
      fetchCandles();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [symbol, timeRange]);

  // Append real-time quote to chart data
  useEffect(() => {
    if (quoteData?.quote && chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const currentPrice = quoteData.quote.c;
      
      // Check if we already have today's data
      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (lastCandle.time === today) {
        // Update existing today's candle
        const updatedData = [...chartData];
        updatedData[updatedData.length - 1] = {
          ...lastCandle,
          id: lastCandle.id, // Preserve the id
          close: currentPrice,
          high: Math.max(lastCandle.high, currentPrice),
          low: Math.min(lastCandle.low, currentPrice),
        };
        setChartData(updatedData);
      } else {
        // Append new candle for today
        const newCandle = {
          id: `${new Date().toISOString().split('T')[0]}-live`,
          time: today,
          open: lastCandle.close,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
        };
        setChartData([...chartData, newCandle]);
      }
    }
  }, [quoteData]);

  const fetchCandles = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      
      // Map time ranges to Alpha Vantage API calls
      // 5Y needs weekly data, everything else uses daily
      if (timeRange === "5Y") {
        endpoint = `/api/trading/market/candles/${symbol}?interval=weekly`;
      } else {
        endpoint = `/api/trading/market/candles/${symbol}?interval=daily`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      console.log("Chart data response:", { endpoint, hasCandles: !!data.candles, candlesLength: data.candles?.length, error: data.error });

      if (data.candles && Array.isArray(data.candles) && data.candles.length > 0) {
        // Filter data based on time range
        const now = new Date();
        const filtered = data.candles.filter((candle: any) => {
          const candleDate = new Date(candle.date);
          const daysDiff = Math.floor((now.getTime() - candleDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (timeRange) {
            case "1D": return daysDiff <= 5; // Show last 5 trading days
            case "1W": return daysDiff <= 7;
            case "1M": return daysDiff <= 31;
            case "3M": return daysDiff <= 93;
            case "6M": return daysDiff <= 186;
            case "1Y": return daysDiff <= 365;
            case "5Y": return daysDiff <= 1825;
            default: return true;
          }
        });

        console.log("Filtered candles:", { total: data.candles.length, filtered: filtered.length, timeRange });

        // Format for chart - data is already in chronological order (oldest to newest)
        const formatted = filtered.map((candle: any, index: number) => {
          const date = new Date(candle.date);
          return {
            id: `${candle.date}-${index}`, // Unique key for React
            time: date.toLocaleDateString("en-US", {
              month: "short",
              day: timeRange === "5Y" ? undefined : "numeric",
              year: timeRange === "5Y" || timeRange === "1Y" ? "numeric" : undefined,
            }),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
            date: candle.date,
          };
        });

        console.log("Formatted chart data:", { count: formatted.length, first: formatted[0]?.date, last: formatted[formatted.length - 1]?.date });
        setChartData(formatted);
      } else {
        console.warn("No candles data:", data);
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching candles:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate if trend is positive based on first and last data points
  const isPositive = chartData.length >= 2 
    ? chartData[chartData.length - 1].close >= chartData[0].close 
    : true;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{symbol} Chart</CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="6M">6M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="5Y">5Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-muted-foreground">No Chart Data Available</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Could not load historical data. Alpha Vantage free tier allows 5 API calls per minute.
                <br />
                <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Get your free API key here
                </a>
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} key={`${symbol}-${timeRange}`}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium mb-2">{label}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Close:</span>
                          <span className="font-semibold">${data.close?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-semibold">${data.high?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-semibold">${data.low?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
