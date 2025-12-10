"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SimulatorHoldingsTableProps {
  holdings: Array<{
    id: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    totalValue?: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    asset: {
      symbol: string;
      name: string;
      logoUrl?: string;
    };
  }>;
  onTradeClick?: (symbol: string) => void;
}

export function SimulatorHoldingsTable({ holdings, onTradeClick }: SimulatorHoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Simulator Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">No positions yet</p>
            <p className="text-sm">Make your first trade to start building your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Simulator Holdings ({holdings.length})
          </CardTitle>
          <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
            Practice Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Avg Cost</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Unrealized P&L</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              // Convert Decimal types to numbers
              const quantityNum = typeof holding.quantity === 'number' ? holding.quantity : Number(holding.quantity);
              const avgBuyPriceNum = typeof holding.averageBuyPrice === 'number' ? holding.averageBuyPrice : Number(holding.averageBuyPrice);
              const currentPriceNum = typeof holding.currentPrice === 'number' ? holding.currentPrice : Number(holding.currentPrice);
              const unrealizedPnLNum = holding.unrealizedPnL ? (typeof holding.unrealizedPnL === 'number' ? holding.unrealizedPnL : Number(holding.unrealizedPnL)) : 0;
              const unrealizedPnLPercentNum = holding.unrealizedPnLPercent ? (typeof holding.unrealizedPnLPercent === 'number' ? holding.unrealizedPnLPercent : Number(holding.unrealizedPnLPercent)) : 0;
              
              const isPositive = unrealizedPnLNum >= 0;
              // Calculate totalValue if not provided
              const totalValue = holding.totalValue ?? (currentPriceNum * quantityNum);
              
              return (
                <TableRow key={holding.id} className="hover:bg-amber-500/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {holding.asset.logoUrl && (
                        <img
                          src={holding.asset.logoUrl}
                          alt={holding.asset.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <div className="font-semibold">{holding.asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.asset.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{quantityNum}</TableCell>
                  <TableCell className="text-right">${avgBuyPriceNum.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${currentPriceNum.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex flex-col items-end ${isPositive ? "text-positive" : "text-negative"}`}>
                      <div className="flex items-center gap-1 font-semibold">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {isPositive ? "+" : ""}${Math.abs(unrealizedPnLNum).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs">
                        {isPositive ? "+" : ""}{unrealizedPnLPercentNum.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {onTradeClick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTradeClick(holding.asset.symbol)}
                        className="border-amber-500/30 hover:bg-amber-500/10"
                      >
                        Trade
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
