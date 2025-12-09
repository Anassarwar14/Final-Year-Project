"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

interface EarningsInfoProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EarningsInfo({ symbol }: EarningsInfoProps) {
  // Get earnings for next 90 days and last 90 days (Finnhub free tier limit)
  const to = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, isLoading, error } = useSWR(
    `/api/trading/market/earnings?from=${from}&to=${to}&symbol=${symbol}`,
    fetcher
  );

  console.log('Earnings data:', { symbol, from, to, data, error });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const earnings = data?.earningsCalendar || [];
  const symbolEarnings = earnings.filter((e: any) => e.symbol === symbol);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Earnings Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {symbolEarnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming earnings reports</p>
        ) : (
          <div className="space-y-4">
            {symbolEarnings.map((earning: any, index: number) => {
              const date = new Date(earning.date);
              const isPast = date < new Date();
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${isPast ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {earning.hour === 'bmo' ? 'Before Market' : earning.hour === 'amc' ? 'After Market' : 'During Market'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Q{earning.quarter} {earning.year}
                    </span>
                  </div>
                  
                  {isPast && (earning.epsActual !== null || earning.revenueActual !== null) ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">EPS</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold">${earning.epsActual?.toFixed(2) || 'N/A'}</span>
                          {earning.epsEstimate && (
                            <span className={`text-xs ${
                              earning.epsActual >= earning.epsEstimate 
                                ? 'text-positive' 
                                : 'text-negative'
                            }`}>
                              vs ${earning.epsEstimate.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold">
                            {earning.revenueActual 
                              ? `$${(earning.revenueActual / 1e6).toFixed(0)}M`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">EPS Estimate</p>
                        <span className="font-semibold">
                          ${earning.epsEstimate?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue Est.</p>
                        <span className="font-semibold">
                          {earning.revenueEstimate 
                            ? `$${(earning.revenueEstimate / 1e6).toFixed(0)}M`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
