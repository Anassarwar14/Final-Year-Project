"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  onTradeExecuted: () => void;
  isMarketOpen?: boolean;
  holdings?: Array<{
    asset: { symbol: string };
    quantity: number;
  }>;
}

export function OrderPanel({ symbol, currentPrice, balance, onTradeExecuted, isMarketOpen = true, holdings = [] }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  // Find current holding for this symbol
  const currentHolding = holdings.find(h => h.asset.symbol === symbol);
  const availableShares = currentHolding?.quantity || 0;

  // Ensure we have a valid price
  const validPrice = currentPrice && currentPrice > 0 ? currentPrice : 0;
  const totalCost = parseFloat(quantity) * validPrice || 0;
  const canAfford = totalCost <= balance;
  const hasShares = availableShares > 0;
  const quantityNum = parseFloat(quantity) || 0;
  const canSell = hasShares && quantityNum <= availableShares && quantityNum > 0;

  const handleTrade = async () => {
    const qty = parseFloat(quantity);
    
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!validPrice || validPrice <= 0) {
      toast.error("Invalid price. Please wait for price data to load.");
      return;
    }

    if (orderType === "buy" && !canAfford) {
      toast.error("Insufficient balance");
      return;
    }

    if (orderType === "sell" && !hasShares) {
      toast.error(`You don't own any shares of ${symbol}`);
      return;
    }

    if (orderType === "sell" && qty > availableShares) {
      toast.error(`Insufficient shares. You only have ${availableShares} shares`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/trading/simulator/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: symbol,
          type: orderType.toUpperCase(),
          quantity: qty,
          pricePerUnit: validPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (Array.isArray(data)) {
          const errorMessages = data.map((err: any) => err.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.error || "Trade failed");
      }

      // Check if order was queued or executed
      if (data.transaction?.pending) {
        toast.success(
          `Order queued: ${orderType === "buy" ? "Buy" : "Sell"} ${qty} shares of ${symbol}`,
          {
            description: `Will execute when market opens. Total: $${totalCost.toFixed(2)}`,
          }
        );
      } else {
        toast.success(
          `Successfully ${orderType === "buy" ? "bought" : "sold"} ${qty} shares of ${symbol}`,
          {
            description: `Total: $${totalCost.toFixed(2)}`,
          }
        );
      }

      setQuantity("");
      onTradeExecuted();
    } catch (error: any) {
      toast.error(error.message || "Failed to execute trade");
    } finally {
      setLoading(false);
    }
  };

  const calculateShares = (percentage: number) => {
    if (orderType === "buy") {
      const amount = balance * percentage;
      const shares = Math.floor(amount / validPrice);
      setQuantity(shares.toString());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="buy" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 data-[state=active]:shadow-lg transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell" 
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white dark:data-[state=active]:bg-rose-600 data-[state=active]:shadow-lg transition-all"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={orderType} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            {orderType === "buy" && (
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => calculateShares(percent / 100)}
                    className="text-xs"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            )}

            {orderType === "sell" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-3 bg-card border rounded-lg">
                  <span className="text-muted-foreground">Available Shares</span>
                  <span className="font-semibold">{availableShares.toLocaleString()} shares</span>
                </div>
                {hasShares && (
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.floor(availableShares * (percent / 100)).toString())}
                        className="text-xs"
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per share</span>
                <span className="font-medium">${validPrice > 0 ? validPrice.toFixed(2) : 'Loading...'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{quantity || 0}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className={`font-bold ${orderType === "buy" ? "text-negative" : "text-positive"}`}>
                  {orderType === "buy" ? "-" : "+"}${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm p-3 bg-card border rounded-lg">
              <span className="text-muted-foreground">Available Balance</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {orderType === "buy" && !canAfford && quantity && (
              <div className="text-sm text-negative p-2 bg-negative/10 rounded">
                Insufficient balance. You need ${(totalCost - balance).toFixed(2)} more.
              </div>
            )}

            {orderType === "sell" && !hasShares && (
              <div className="text-sm text-negative p-2 bg-negative/10 rounded">
                You don't own any shares of {symbol}. Buy some first to enable selling.
              </div>
            )}

            {orderType === "sell" && hasShares && quantityNum > availableShares && (
              <div className="text-sm text-negative p-2 bg-negative/10 rounded">
                Insufficient shares. You only have {availableShares} shares available.
              </div>
            )}

            {!isMarketOpen && (
              <div className="text-sm text-amber-600 dark:text-amber-400 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                ⚠️ Market is closed. Order will be queued and executed when market opens.
              </div>
            )}

            <Button
              onClick={handleTrade}
              disabled={
                loading || 
                !quantity || 
                !validPrice || 
                validPrice <= 0 || 
                (orderType === "buy" && !canAfford) ||
                (orderType === "sell" && (!hasShares || !canSell))
              }
              size="lg"
              className={`w-full font-semibold text-white transition-all ${
                orderType === "buy" 
                  ? "bg-positive hover:bg-positive/90 hover:shadow-lg" 
                  : "bg-negative hover:bg-negative/90 hover:shadow-lg"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <span className="animate-pulse">Processing...</span>
                </>
              ) : (
                <>
                  {orderType === "buy" ? "Buy" : "Sell"} {symbol}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
