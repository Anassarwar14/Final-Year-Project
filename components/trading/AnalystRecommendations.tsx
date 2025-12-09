"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import useSWR from "swr";

interface AnalystRecommendationsProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AnalystRecommendations({ symbol }: AnalystRecommendationsProps) {
  const { data, isLoading } = useSWR(
    `/api/trading/market/recommendations/${symbol}`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analyst Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = data?.recommendations?.[0]; // Latest month

  if (!recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analyst Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No analyst data available</p>
        </CardContent>
      </Card>
    );
  }

  const total =
    recommendations.strongBuy +
    recommendations.buy +
    recommendations.hold +
    recommendations.sell +
    recommendations.strongSell;

  const getRecommendation = () => {
    const bullish = recommendations.strongBuy + recommendations.buy;
    const bearish = recommendations.sell + recommendations.strongSell;
    
    if (bullish > bearish * 2) return { text: "Strong Buy", icon: TrendingUp, color: "text-positive" };
    if (bullish > bearish) return { text: "Buy", icon: TrendingUp, color: "text-positive" };
    if (bearish > bullish * 2) return { text: "Strong Sell", icon: TrendingDown, color: "text-negative" };
    if (bearish > bullish) return { text: "Sell", icon: TrendingDown, color: "text-negative" };
    return { text: "Hold", icon: Minus, color: "text-muted-foreground" };
  };

  const consensus = getRecommendation();
  const ConsensusIcon = consensus.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Analyst Recommendations</CardTitle>
          <div className="flex items-center gap-1 font-semibold">
            <ConsensusIcon className="h-4 w-4" />
            <span className="text-sm">{consensus.text}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {total} analyst{total !== 1 ? "s" : ""} · {recommendations.period}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-positive font-medium">Strong Buy</span>
            <span className="font-semibold">{recommendations.strongBuy}</span>
          </div>
          <Progress
            value={(recommendations.strongBuy / total) * 100}
            className="h-2 bg-positive/20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Buy</span>
            <span className="font-semibold">{recommendations.buy}</span>
          </div>
          <Progress
            value={(recommendations.buy / total) * 100}
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Hold</span>
            <span className="font-semibold">{recommendations.hold}</span>
          </div>
          <Progress
            value={(recommendations.hold / total) * 100}
            className="h-2 bg-muted"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Sell</span>
            <span className="font-semibold">{recommendations.sell}</span>
          </div>
          <Progress
            value={(recommendations.sell / total) * 100}
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-negative font-medium">Strong Sell</span>
            <span className="font-semibold">{recommendations.strongSell}</span>
          </div>
          <Progress
            value={(recommendations.strongSell / total) * 100}
            className="h-2 bg-negative/20"
          />
        </div>
      </CardContent>
    </Card>
  );
}
