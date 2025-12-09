"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

interface HoldingsTableProps {
  holdings?: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [sortBy, setSortBy] = useState<"symbol" | "value" | "pnl">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sample data
  const sampleHoldings: Holding[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 50,
      avgPrice: 170.50,
      currentPrice: 245.32,
      value: 12266.00,
      pnl: 3741.00,
      pnlPercent: 43.88,
      allocation: 36.5,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      quantity: 30,
      avgPrice: 340.00,
      currentPrice: 428.75,
      value: 12862.50,
      pnl: 2662.50,
      pnlPercent: 26.10,
      allocation: 38.3,
    },
  ];

  const data = holdings || sampleHoldings;

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;
    switch (sortBy) {
      case "symbol":
        return a.symbol.localeCompare(b.symbol) * multiplier;
      case "value":
        return (a.value - b.value) * multiplier;
      case "pnl":
        return (a.pnl - b.pnl) * multiplier;
      default:
        return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center gap-1">
                    Stock
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("value")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("pnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    P&L
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((holding) => (
                <TableRow key={holding.symbol} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-semibold">{holding.symbol}</div>
                      <div className="text-xs text-muted-foreground">{holding.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{holding.quantity}</TableCell>
                  <TableCell className="text-right text-sm">
                    ${holding.avgPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${holding.currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      holding.pnl >= 0 ? "text-positive" : "text-negative"
                    }`}>
                      {holding.pnl >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <div>
                        <div className="font-semibold">
                          {holding.pnl >= 0 ? "+" : ""}${Math.abs(holding.pnl).toFixed(2)}
                        </div>
                        <div className="text-xs">
                          {holding.pnl >= 0 ? "+" : ""}{holding.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm">{holding.allocation}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
