"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Holding {
  asset: {
    symbol: string;
    name: string;
  };
  quantity: number;
  averageBuyPrice: number;
  currentPrice?: number;
  value?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
}

interface HoldingsListProps {
  holdings: Holding[];
}

export function HoldingsList({ holdings }: HoldingsListProps) {
  if (!holdings || holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No holdings yet</p>
            <p className="text-xs mt-1">Start trading to build your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {holdings.map((holding, index) => {
            // Use backend-calculated values if available
            const value = holding.value ?? (holding.currentPrice || holding.averageBuyPrice) * holding.quantity;
            const unrealizedPnL = holding.unrealizedPnL ?? 0;
            const unrealizedPnLPercent = holding.unrealizedPnLPercent ?? 0;
            const isPositive = unrealizedPnL >= 0;
            const hasChange = Math.abs(unrealizedPnL) > 0.01; // Only show change if meaningful

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base">{holding.asset.symbol}</span>
                    <Badge variant="secondary" className="text-xs">
                      {holding.quantity} {holding.quantity === 1 ? 'share' : 'shares'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {holding.asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg. ${holding.averageBuyPrice.toFixed(2)} • Current ${(holding.currentPrice || holding.averageBuyPrice).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {hasChange && (
                    <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      <span>
                        {isPositive ? "+" : ""}${Math.abs(unrealizedPnL).toFixed(2)} ({isPositive ? "+" : ""}{unrealizedPnLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                  {!hasChange && (
                    <div className="text-xs text-muted-foreground">
                      No change
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
