// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { TrendingUp, TrendingDown } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface HoldingsTableProps {
//   holdings: Array<{
//     id: string;
//     quantity: number;
//     averagePrice: number;
//     currentPrice: number;
//     totalValue: number;
//     unrealizedPnL: number;
//     unrealizedPnLPercent: number;
//     asset: {
//       symbol: string;
//       name: string;
//       logoUrl?: string;
//     };
//   }>;
//   onTradeClick?: (symbol: string) => void;
// }

// export function HoldingsTable({ holdings, onTradeClick }: HoldingsTableProps) {
//   if (holdings.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Holdings</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-12 text-muted-foreground">
//             <p className="mb-2">No holdings yet</p>
//             <p className="text-sm">Start trading to build your portfolio</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Holdings ({holdings.length})</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Asset</TableHead>
//               <TableHead className="text-right">Shares</TableHead>
//               <TableHead className="text-right">Avg Price</TableHead>
//               <TableHead className="text-right">Current Price</TableHead>
//               <TableHead className="text-right">Total Value</TableHead>
//               <TableHead className="text-right">P&L</TableHead>
//               <TableHead></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {holdings.map((holding) => {
//               const isPositive = holding.unrealizedPnL >= 0;
//               return (
//                 <TableRow key={holding.id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       {holding.asset.logoUrl && (
//                         <img
//                           src={holding.asset.logoUrl}
//                           alt={holding.asset.symbol}
//                           className="w-8 h-8 rounded-full"
//                           onError={(e) => {
//                             (e.target as HTMLImageElement).style.display = "none";
//                           }}
//                         />
//                       )}
//                       <div>
//                         <div className="font-semibold">{holding.asset.symbol}</div>
//                         <div className="text-sm text-muted-foreground">{holding.asset.name}</div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-right font-medium">{holding.quantity}</TableCell>
//                   <TableCell className="text-right">${holding.averagePrice.toFixed(2)}</TableCell>
//                   <TableCell className="text-right font-medium">
//                     ${holding.currentPrice.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right font-semibold">
//                     ${holding.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className={`flex flex-col items-end ${isPositive ? "text-positive" : "text-negative"}`}>
//                       <div className="flex items-center gap-1 font-semibold">
//                         {isPositive ? (
//                           <TrendingUp className="h-3 w-3" />
//                         ) : (
//                           <TrendingDown className="h-3 w-3" />
//                         )}
//                         <span>
//                           {isPositive ? "+" : ""}${holding.unrealizedPnL.toFixed(2)}
//                         </span>
//                       </div>
//                       <span className="text-xs">
//                         {isPositive ? "+" : ""}{holding.unrealizedPnLPercent.toFixed(2)}%
//                       </span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     {onTradeClick && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => onTradeClick(holding.asset.symbol)}
//                       >
//                         Trade
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HoldingsTableProps {
  holdings: Array<{
    id: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    asset: {
      symbol: string;
      name: string;
      logoUrl?: string;
    };
  }>;
  onTradeClick?: (symbol: string) => void;
}

export function HoldingsTable({ holdings, onTradeClick }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">No holdings yet</p>
            <p className="text-sm">Start trading to build your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    console.log(holdings),
    <Card>
      <CardHeader>
        <CardTitle>Holdings ({holdings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const isPositive = holding.unrealizedPnL >= 0;
              return (
                <TableRow key={holding.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {holding.asset.logoUrl && (
                        <img
                          src={holding.asset.logoUrl}
                          alt={holding.asset.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <div className="font-semibold">{holding.asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.asset.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{holding.quantity}</TableCell>
                  <TableCell className="text-right"> ${ (holding.averagePrice ?? 0).toFixed(2) }</TableCell>
                  <TableCell className="text-right font-medium">
                    ${ (holding.currentPrice ?? 0).toFixed(2) }
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${ (holding.totalValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex flex-col items-end ${isPositive ? "text-positive" : "text-negative"}`}>
                      <div className="flex items-center gap-1 font-semibold">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {isPositive ? "+" : ""}${ (holding.unrealizedPnL ?? 0).toFixed(2) }
                        </span>
                      </div>
                      <span className="text-xs">
                        {isPositive ? "+" : ""}{ (holding.unrealizedPnLPercent ?? 0).toFixed(2) }%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {onTradeClick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTradeClick(holding.asset.symbol)}
                      >
                        Trade
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
