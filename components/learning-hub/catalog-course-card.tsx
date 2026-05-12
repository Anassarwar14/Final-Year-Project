"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { HubCourseCategory } from "@/lib/learning-hub-api";
import type { LearningCatalogItem } from "@/lib/learning-hub-catalog";

const categoryLabel: Record<HubCourseCategory, string> = {
  CRYPTO: "Crypto",
  TRADING: "Trading",
  FINANCE: "Finance",
};

export function LearningCatalogCourseCard({
  item,
  progressPercent = 0,
}: {
  item: LearningCatalogItem;
  progressPercent?: number;
}) {
  const soon = Boolean(item.comingSoon);
  const showProgress = !soon && progressPercent > 0;

  const inner = (
    <>
      <div className="relative aspect-video w-full bg-muted">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {soon ? <Sparkles className="h-10 w-10 opacity-60" /> : <BookOpen className="h-10 w-10" />}
          </div>
        )}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge variant="secondary">{categoryLabel[item.category]}</Badge>
          <Badge variant="outline" className="bg-background/80">
            {item.sourceLabel}
          </Badge>
        </div>
        {soon && (
          <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium">
            To be announced
          </div>
        )}
        {showProgress && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-background/90 px-3 py-2">
            <div className="mb-1 flex justify-between text-xs">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
        <CardDescription className="line-clamp-3">{item.description}</CardDescription>
      </CardHeader>
    </>
  );

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-lg ${soon ? "opacity-95" : ""}`}>
      {soon ? (
        <div className="block">{inner}</div>
      ) : (
        <Link
          href={item.href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {inner}
        </Link>
      )}
      <CardContent className="flex items-center justify-between gap-2 pt-0">
        <span className="text-xs text-muted-foreground">
          {soon ? "Details later" : `${item.chapterCount} lesson${item.chapterCount === 1 ? "" : "s"}`}
        </span>
        {soon ? (
          <Button size="sm" variant="secondary" disabled className="cursor-not-allowed">
            Coming soon
          </Button>
        ) : (
          <Button size="sm" className="gap-1" asChild>
            <Link href={item.href}>
              <BookOpen className="h-4 w-4" />
              Open
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
