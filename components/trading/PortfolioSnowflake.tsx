"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface PortfolioSnowflakeProps {
  value?: number;
  future?: number;
  past?: number;
  health?: number;
  dividend?: number;
}

export function PortfolioSnowflake({ 
  value = 70, 
  future = 65, 
  past = 80, 
  health = 75, 
  dividend = 50 
}: PortfolioSnowflakeProps) {
  const segments = [
    { label: "VALUE", score: value, color: "#10b981" },
    { label: "FUTURE", score: future, color: "#06b6d4" },
    { label: "PAST", score: past, color: "#8b5cf6" },
    { label: "HEALTH", score: health, color: "#f59e0b" },
    { label: "DIVIDEND", score: dividend, color: "#ec4899" },
  ];

  const points = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    
    return segments.map((segment, i) => {
      const angle = (i * 72 - 90) * (Math.PI / 180); // 360/5 = 72 degrees
      const radius = (segment.score / 100) * maxRadius;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        ...segment,
      };
    });
  }, [segments]);

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Portfolio Snowflake</CardTitle>
        <p className="text-xs text-muted-foreground">
          A comprehensive portfolio with a solid track record
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-lg">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((percent) => (
            <circle
              key={percent}
              cx="150"
              cy="150"
              r={(percent / 100) * 120}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted/20"
            />
          ))}

          {/* Reference lines */}
          {segments.map((_, i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const x = 150 + 120 * Math.cos(angle);
            const y = 150 + 120 * Math.sin(angle);
            return (
              <line
                key={i}
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted/20"
              />
            );
          })}

          {/* Filled area */}
          <path
            d={pathData}
            fill="url(#snowflake-gradient)"
            stroke="#10b981"
            strokeWidth="2"
            className="animate-in fade-in duration-1000"
            style={{ 
              filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))"
            }}
          />

          {/* Score points */}
          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={point.color}
                stroke="white"
                strokeWidth="2"
                className="animate-in zoom-in duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              <text
                x={point.x + (point.x - 150) * 0.3}
                y={point.y + (point.y - 150) * 0.3}
                textAnchor="middle"
                className="text-xs font-semibold fill-current"
                style={{ fontSize: '10px' }}
              >
                {point.label}
              </text>
              <text
                x={point.x + (point.x - 150) * 0.3}
                y={point.y + (point.y - 150) * 0.3 + 12}
                textAnchor="middle"
                className="text-xs fill-current opacity-70"
                style={{ fontSize: '9px' }}
              >
                {point.score}%
              </text>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <radialGradient id="snowflake-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-3 mt-4 w-full text-center">
          {segments.map((segment, i) => (
            <div key={i} className="space-y-1">
              <div 
                className="w-3 h-3 rounded-full mx-auto" 
                style={{ backgroundColor: segment.color }}
              />
              <p className="text-xs font-medium">{segment.label}</p>
              <p className="text-xs text-muted-foreground">{segment.score}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
