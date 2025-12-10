"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X, TrendingUp, TrendingDown, Play } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PendingOrders() {
  const [processing, setProcessing] = useState(false);
  const { data, mutate, isLoading } = useSWR("/api/trading/simulator/pending-orders", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const orders = data?.orders || [];

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/trading/simulator/pending-orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const handleProcessOrders = async () => {
    setProcessing(true);
    try {
      const response = await fetch("/api/trading/simulator/pending-orders/process", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Process orders error:", result);
        throw new Error(result.error || "Failed to process orders");
      }

      console.log("Process orders result:", result);
      
      if (result.processed > 0) {
        toast.success(`Processed ${result.processed} order(s)`, {
          description: result.failed > 0 ? `${result.failed} order(s) failed` : undefined,
        });
      } else if (result.failed > 0) {
        toast.error(`Failed to process ${result.failed} order(s)`, {
          description: result.results?.map((r: any) => `${r.symbol}: ${r.error}`).join(", "),
        });
      } else {
        toast.info("No orders to process");
      }
      
      mutate();
    } catch (error: any) {
      console.error("Process orders exception:", error);
      toast.error(error.message || "Failed to process orders");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pending orders. Orders placed when market is closed will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Orders
            <Badge variant="secondary">{orders.length}</Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleProcessOrders}
            disabled={processing}
            className="gap-2"
          >
            <Play className="h-3 w-3" />
            Process Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order: any) => {
            const totalValue = parseFloat(order.quantity) * parseFloat(order.pricePerUnit);
            const isBuy = order.type === "BUY";

            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isBuy ? (
                    <div className="p-2 rounded-full bg-emerald-500/10">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-rose-500/10">
                      <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.asset.symbol}</span>
                      <Badge variant={isBuy ? "default" : "secondary"} className="text-xs">
                        {order.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {parseFloat(order.quantity).toFixed(0)} shares @ ${parseFloat(order.pricePerUnit).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">${totalValue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Karachi',
                      })} PKT
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancelOrder(order.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Orders will automatically execute when market opens (7:30 PM PKT)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
