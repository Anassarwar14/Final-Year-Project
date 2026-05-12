"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { MdArrowDropUp, MdArrowDropDown  } from "react-icons/md";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TickerStock {
  ticker?: string;
  symbol?: string;
  name?: string;
  logo?: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export function MarketTicker() {
  const { data, isLoading, error } = useSWR("/api/trading/market/top-movers", fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  const [activeStocks, setActiveStocks] = useState<TickerStock[]>([]);

  useEffect(() => {
    console.log("MarketTicker - API Response:", { data, isLoading, error });
    
    if (data) {
      // Combine top gainers, losers, and most active
      const gainers = (data.top_gainers || []).slice(0, 5);
      const losers = (data.top_losers || []).slice(0, 5);
      const active = (data.most_actively_traded || []).slice(0, 5);
      
      console.log("MarketTicker - Parsed data:", { gainers, losers, active });
      
      // Mix them for variety
      const mixed = [...gainers, ...losers, ...active];
      setActiveStocks(mixed);
    }
  }, [data]);

  // Duplicate the array for seamless loop
  const displayStocks = [...activeStocks, ...activeStocks, ...activeStocks];

  if (activeStocks.length === 0) {
    console.log("MarketTicker: No stocks to display");
    return null;
  }

  console.log(`MarketTicker: Rendering ${activeStocks.length} stocks`);

  return (
    <div className="w-full max-w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
      <div className="relative w-full overflow-hidden py-3">
        <div className="flex animate-scroll">
          {displayStocks.map((stock, index) => {
            const isPositive = parseFloat(stock.change_percentage?.replace("%", "") || "0") >= 0;
            const ticker = stock.symbol || stock.ticker || "N/A";
            const displayName = stock.name || ticker;
            const price = stock.price ? `$${parseFloat(stock.price).toFixed(2)}` : "N/A";
            const initials = displayName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            
            return (
              <div 
                key={`${ticker}-${index}`} 
                className="inline-flex items-center gap-3 p-3 mx-4 rounded-2xl bg-card/65 backdrop-blur-sm border border-border/50 shadow-sm shrink-0 whitespace-nowrap"
              >
                
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden text-xs font-bold text-muted-foreground">
                  {stock.logo ? (
                    <img
                      src={stock.logo}
                      alt={displayName}
                      className="h-full w-full object-contain p-1.5"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <span>{initials || ticker.slice(0, 2)}</span>
                  )}
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-sm text-foreground">{displayName}</span>
                  {/* {ticker !== "N/A" && <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{ticker}</span>} */}
                  <span className="items-start font-semibold text-sm text-primary">{price}</span>
                </div>

                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive ? "text-positive" : "text-negative"
                }`}>
                  {isPositive ? (
                    <MdArrowDropUp className="h-5 w-5" />
                  ) : (
                    <MdArrowDropDown className="h-5 w-5" />
                  )}
                  {stock.change_percentage || "0%"}
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
