"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import useSWR from "swr";

interface CompanyInfoProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CompanyInfo({ symbol }: CompanyInfoProps) {
  const [logoError, setLogoError] = useState(false);
  const { data: profileData, isLoading: profileLoading } = useSWR(
    `/api/trading/market/profile/${symbol}`,
    fetcher
  );
  
  const { data: financialsData, isLoading: financialsLoading } = useSWR(
    `/api/trading/market/financials/${symbol}`,
    fetcher
  );

  if (profileLoading || financialsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const profile = profileData?.profile;
  const metrics = financialsData?.financials?.metric;

  if (!profile && !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No company data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatLargeNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {profile?.logo && !logoError && (
            <img
              src={profile.logo}
              alt={profile.name}
              className="w-10 h-10 rounded"
              onError={() => setLogoError(true)}
            />
          )}
          <div>
            <CardTitle className="text-base">{profile?.name || symbol}</CardTitle>
            {profile?.exchange && (
              <p className="text-xs text-muted-foreground">{profile.exchange} · {profile.country}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.finnhubIndustry && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Industry:</span>
            <span className="font-medium">{profile.finnhubIndustry}</span>
          </div>
        )}

        {metrics && (
          <>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="text-sm font-semibold">{formatLargeNumber(metrics.marketCapitalization)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
                <p className="text-sm font-semibold">{metrics.peBasicExclExtraTTM?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dividend Yield</p>
                <p className="text-sm font-semibold">{metrics.dividendYieldIndicatedAnnual?.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beta</p>
                <p className="text-sm font-semibold">{metrics.beta?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W High</p>
                <p className="text-sm font-semibold">${metrics["52WeekHigh"]?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W Low</p>
                <p className="text-sm font-semibold">${metrics["52WeekLow"]?.toFixed(2) || "N/A"}</p>
              </div>
            </div>

            {profile?.weburl && (
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block pt-2 border-t"
              >
                Visit website →
              </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
