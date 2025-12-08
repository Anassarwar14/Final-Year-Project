"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import useSWR from "swr";

interface RealtimeQuoteProps {
  symbol: string;
  showLogo?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RealtimeQuote({ symbol, showLogo = true }: RealtimeQuoteProps) {
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | "none">("none");
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [logoError, setLogoError] = useState(false);

  const { data: quoteData, isLoading, error } = useSWR(
    `/api/trading/market/quote/${symbol}`,
    fetcher,
    {
      refreshInterval: 15000, // 15 seconds for real-time updates
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  console.log('RealtimeQuote data:', { symbol, quoteData, isLoading, error });
  console.log('Quote object:', quoteData?.quote);
  console.log('Asset object:', quoteData?.asset);

  const quote = quoteData?.quote;
  const asset = quoteData?.asset;
  const currentPrice = quote?.c || 0;
  const change = quote?.d || 0;
  const changePercent = quote?.dp || 0;
  const isPositive = change >= 0;

  // Flickering effect when price changes
  useEffect(() => {
    if (prevPrice !== null && currentPrice !== prevPrice) {
      if (currentPrice > prevPrice) {
        setPriceFlash("up");
      } else if (currentPrice < prevPrice) {
        setPriceFlash("down");
      }
      
      const timer = setTimeout(() => setPriceFlash("none"), 500);
      return () => clearTimeout(timer);
    }
    setPrevPrice(currentPrice);
  }, [currentPrice, prevPrice]);

  // Reset logo error when symbol changes
  useEffect(() => {
    setLogoError(false);
  }, [symbol]);

  if (isLoading || !quote) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-6 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {showLogo && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {logoError || !asset?.logo ? (
            <span className="text-lg font-bold">{symbol[0]}</span>
          ) : (
            <img
              src={asset.logo}
              alt={asset.name || symbol}
              className="w-full h-full object-cover"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
      )}
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold">{symbol}</h2>
          <span
            className={`text-2xl font-bold transition-all duration-300 ${
              priceFlash === "up"
                ? "text-positive scale-110"
                : priceFlash === "down"
                ? "text-negative scale-90"
                : ""
            }`}
          >
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isPositive ? "text-positive" : "text-negative"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="font-semibold text-sm">
            {isPositive ? "+" : ""}
            {change.toFixed(2)} ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
