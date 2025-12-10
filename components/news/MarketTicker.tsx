"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TickerStock {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export function MarketTicker() {
  const { data } = useSWR("/api/trading/market/top-movers", fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  const [activeStocks, setActiveStocks] = useState<TickerStock[]>([]);

  useEffect(() => {
    if (data) {
      // Combine top gainers, losers, and most active
      const gainers = (data.top_gainers || []).slice(0, 5);
      const losers = (data.top_losers || []).slice(0, 5);
      const active = (data.most_actively_traded || []).slice(0, 5);
      
      // Mix them for variety
      const mixed = [...gainers, ...losers, ...active];
      setActiveStocks(mixed);
    }
  }, [data]);

  // Duplicate the array for seamless loop
  const displayStocks = [...activeStocks, ...activeStocks, ...activeStocks];

  if (activeStocks.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
      <div className="relative w-full overflow-hidden py-3">
        <div className="flex animate-scroll">
          {displayStocks.map((stock, index) => {
            const isPositive = parseFloat(stock.change_percentage.replace("%", "")) >= 0;
            
            return (
              <div 
                key={`${stock.ticker}-${index}`} 
                className="inline-flex items-center gap-2 px-4 py-1 mx-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shrink-0"
              >
                <span className="font-bold text-sm">{stock.ticker}</span>
                <span className="font-semibold text-sm">
                  ${parseFloat(stock.price).toFixed(2)}
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? "text-positive" : "text-negative"
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stock.change_percentage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
          display: flex;
          width: max-content;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
