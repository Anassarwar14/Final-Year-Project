"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Newspaper } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyNewsProps {
  symbol: string;
  limit?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CompanyNews({ symbol, limit = 10 }: CompanyNewsProps) {
  // Get last 30 days of news
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, isLoading } = useSWR(
    `/api/trading/market/news/company/${symbol}?from=${from}&to=${to}`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Company News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const news = data?.news || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          Company News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent news available</p>
        ) : (
          <div className="space-y-4">
            {news.slice(0, limit).map((article: any) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group hover:bg-muted/50 p-3 rounded-lg transition-colors"
              >
                <div className="flex gap-3">
                  {article.image && (
                    <img
                      src={article.image}
                      alt=""
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.headline}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
