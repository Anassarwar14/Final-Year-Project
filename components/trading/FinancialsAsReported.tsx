"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialsAsReportedProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function FinancialsAsReported({ symbol }: FinancialsAsReportedProps) {
  const { data, isLoading, error } = useSWR(
    `/api/trading/market/financials/${symbol}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  console.log('Financials as reported data:', { symbol, data, error });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financial Statements
          </CardTitle>
          <CardDescription>As Reported to SEC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const financials = data?.financials;
  
  if (!financials || !financials.metric) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financial Statements
          </CardTitle>
          <CardDescription>Key Financial Metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = financials.metric;
  
  // Key metrics to display from Finnhub's metric data
  const displayMetrics = [
    { label: "EPS (TTM)", key: "epsTTM", prefix: "$" },
    { label: "Revenue Per Share", key: "revenuePerShareTTM", prefix: "$" },
    { label: "P/E Ratio", key: "peTTM", prefix: "" },
    { label: "Price to Book", key: "pb", prefix: "" },
    { label: "Market Cap", key: "marketCapitalization", prefix: "$", suffix: "M" },
    { label: "Enterprise Value", key: "enterpriseValue", prefix: "$", suffix: "M" },
    { label: "Net Margin", key: "netProfitMarginTTM", prefix: "", suffix: "%" },
    { label: "Operating Margin", key: "operatingMarginTTM", prefix: "", suffix: "%" },
    { label: "ROE (TTM)", key: "roeTTM", prefix: "", suffix: "%" },
    { label: "ROA (TTM)", key: "roaTTM", prefix: "", suffix: "%" },
    { label: "Current Ratio", key: "currentRatioQuarterly", prefix: "" },
    { label: "Debt to Equity", key: "totalDebt/totalEquityQuarterly", prefix: "" },
  ];

  const formatValue = (value: number, prefix: string, suffix?: string) => {
    if (value === undefined || value === null) return "N/A";
    
    let formatted = "";
    if (suffix === "M") {
      formatted = `${prefix}${value.toFixed(2)}${suffix}`;
    } else if (suffix === "%") {
      formatted = `${value.toFixed(2)}${suffix}`;
    } else if (prefix === "$") {
      formatted = `${prefix}${value.toFixed(2)}`;
    } else {
      formatted = value.toFixed(2);
    }
    return formatted;
  };

  const availableMetrics = displayMetrics
    .filter(metric => metrics[metric.key] !== undefined && metrics[metric.key] !== null)
    .map(metric => ({
      ...metric,
      value: metrics[metric.key]
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Financial Metrics
        </CardTitle>
        <CardDescription>
          Key Financial Data from Finnhub
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableMetrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Financial metrics not available
          </p>
        ) : (
          <div className="space-y-3">
            {availableMetrics.map((metric) => {
              const value = metric.value;
              const formattedValue = formatValue(value, metric.prefix || "", metric.suffix);
              
              return (
                <div 
                  key={metric.key}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm font-semibold">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Source: Financial metrics from Finnhub
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
