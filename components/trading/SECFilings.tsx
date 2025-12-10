"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SECFilingsProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SECFilings({ symbol }: SECFilingsProps) {
  // Get last 2 years of filings for better coverage
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, isLoading, error } = useSWR(
    `/api/trading/market/sec/${symbol}?from=${from}&to=${to}`,
    fetcher
  );

  console.log('SEC filings data:', { symbol, from, to, data, error });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SEC Filings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const filings = data?.filings || [];
  
  // Prioritize forms by importance
  const formPriority: { [key: string]: number } = {
    '10-K': 1,  // Annual report
    '10-Q': 2,  // Quarterly report
    '8-K': 3,   // Current events
    'DEF 14A': 4, // Proxy statement
    '4': 5,     // Insider trading
    'S-1': 6,   // IPO registration
    'S-3': 7,   // Shelf registration
    '10-K/A': 8, // Amended annual
    '10-Q/A': 9, // Amended quarterly
  };
  
  const importantForms = Object.keys(formPriority);
  
  // Filter and sort by priority
  const filtered = filings
    .filter((f: any) => importantForms.includes(f.form))
    .sort((a: any, b: any) => {
      const priorityA = formPriority[a.form] || 999;
      const priorityB = formPriority[b.form] || 999;
      if (priorityA !== priorityB) return priorityA - priorityB;
      // If same priority, sort by date (newest first)
      return new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime();
    })
    .slice(0, 15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          SEC Filings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No recent SEC filings available</p>
            <p className="text-xs text-muted-foreground">
              SEC filings data may require premium API access or the data might not be available for this time period.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filtered.map((filing: any, index: number) => (
              <a
                key={index}
                href={filing.reportUrl || filing.filingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      filing.form === '10-K' ? 'default' : 
                      filing.form === '10-Q' ? 'secondary' : 
                      filing.form === '8-K' ? 'outline' : 
                      'secondary'
                    }
                    className="font-mono text-xs min-w-[60px] justify-center"
                  >
                    {filing.form}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(filing.filedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Showing key filings (10-K, 10-Q, 8-K, etc.) sorted by importance
        </p>
      </CardContent>
    </Card>
  );
}
