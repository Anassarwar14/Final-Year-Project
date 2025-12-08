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
            const value = (holding.currentPrice || holding.averageBuyPrice) * holding.quantity;
            const costBasis = holding.averageBuyPrice * holding.quantity;
            const gain = value - costBasis;
            const gainPercent = (gain / costBasis) * 100;
            const isPositive = gain >= 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{holding.asset.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {holding.quantity} shares
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {holding.asset.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <div className={`flex items-center justify-end gap-1 text-xs ${isPositive ? "text-positive" : "text-negative"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>
                      {isPositive ? "+" : ""}${Math.abs(gain).toFixed(2)} ({isPositive ? "+" : ""}{gainPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
