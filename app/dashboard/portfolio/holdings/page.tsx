// "use client"

// import { AppSidebar } from "@/components/app-sidebar"
// import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   TrendingUp,
//   ArrowUpRight,
//   ArrowDownRight,
//   Search,
//   Filter,
//   MoreHorizontal,
//   Plus,
//   Download,
//   Eye,
//   Edit,
//   Trash2,
// } from "lucide-react"

// // Extended holdings data
// const holdings = [
//   {
//     symbol: "AAPL",
//     name: "Apple Inc.",
//     sector: "Technology",
//     shares: 50,
//     avgCost: 165.2,
//     currentPrice: 185.92,
//     marketValue: 9296,
//     totalCost: 8260,
//     gainLoss: 1036,
//     gainLossPercent: 12.54,
//     dayChange: 2.34,
//     dayChangePercent: 1.27,
//     weight: 15.97,
//   },
//   {
//     symbol: "MSFT",
//     name: "Microsoft Corporation",
//     sector: "Technology",
//     shares: 40,
//     avgCost: 340.15,
//     currentPrice: 378.85,
//     marketValue: 15154,
//     totalCost: 13606,
//     gainLoss: 1548,
//     gainLossPercent: 11.38,
//     dayChange: 5.67,
//     dayChangePercent: 1.52,
//     weight: 26.04,
//   },
//   {
//     symbol: "GOOGL",
//     name: "Alphabet Inc.",
//     sector: "Technology",
//     shares: 25,
//     avgCost: 148.9,
//     currentPrice: 142.56,
//     marketValue: 3564,
//     totalCost: 3722.5,
//     gainLoss: -158.5,
//     gainLossPercent: -4.26,
//     dayChange: -1.23,
//     dayChangePercent: -0.86,
//     weight: 6.12,
//   },
//   {
//     symbol: "TSLA",
//     name: "Tesla Inc.",
//     sector: "Consumer Discretionary",
//     shares: 30,
//     avgCost: 220.75,
//     currentPrice: 248.5,
//     marketValue: 7455,
//     totalCost: 6622.5,
//     gainLoss: 832.5,
//     gainLossPercent: 12.57,
//     dayChange: 8.92,
//     dayChangePercent: 3.72,
//     weight: 12.81,
//   },
//   {
//     symbol: "NVDA",
//     name: "NVIDIA Corporation",
//     sector: "Technology",
//     shares: 15,
//     avgCost: 820.4,
//     currentPrice: 875.28,
//     marketValue: 13129,
//     totalCost: 12306,
//     gainLoss: 823,
//     gainLossPercent: 6.69,
//     dayChange: 12.45,
//     dayChangePercent: 1.44,
//     weight: 22.56,
//   },
//   {
//     symbol: "JPM",
//     name: "JPMorgan Chase & Co.",
//     sector: "Financial Services",
//     shares: 35,
//     avgCost: 142.8,
//     currentPrice: 158.45,
//     marketValue: 5545.75,
//     totalCost: 4998,
//     gainLoss: 547.75,
//     gainLossPercent: 10.96,
//     dayChange: 1.25,
//     dayChangePercent: 0.79,
//     weight: 9.53,
//   },
// ]

// export default function HoldingsPage() {
//   return (
//     <>
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <div className="h-4 w-px bg-sidebar-border" />
//             <div className="flex items-center gap-2">
//               <TrendingUp className="h-5 w-5 text-primary" />
//               <h1 className="text-lg font-semibold">Holdings</h1>
//             </div>
//           </div>
//           <div className="ml-auto px-4 flex items-center gap-2">
//             <Button variant="outline" size="sm" className="gap-2 bg-transparent">
//               <Download className="h-4 w-4" />
//               Export
//             </Button>
//             <Button size="sm" className="gap-2">
//               <Plus className="h-4 w-4" />
//               Add Position
//             </Button>
//           </div>
//         </header>

//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           {/* Summary Cards */}
//           <div className="grid gap-4 md:grid-cols-4">
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">6</div>
//                 <p className="text-xs text-muted-foreground">Active positions</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium">Total Value</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">$54,143</div>
//                 <p className="text-xs text-green-600 flex items-center gap-1">
//                   <ArrowUpRight className="h-3 w-3" />
//                   +$4,628 (+9.34%)
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium">Day's Change</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-green-600">+$1,240</div>
//                 <p className="text-xs text-green-600 flex items-center gap-1">
//                   <ArrowUpRight className="h-3 w-3" />
//                   +2.34% today
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">TSLA</div>
//                 <p className="text-xs text-green-600 flex items-center gap-1">
//                   <ArrowUpRight className="h-3 w-3" />
//                   +3.72% today
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Filters and Search */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Your Holdings</CardTitle>
//                   <CardDescription>Detailed view of all your positions</CardDescription>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="relative">
//                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                     <Input placeholder="Search holdings..." className="pl-8 w-64" />
//                   </div>
//                   <Select>
//                     <SelectTrigger className="w-40">
//                       <SelectValue placeholder="All Sectors" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Sectors</SelectItem>
//                       <SelectItem value="technology">Technology</SelectItem>
//                       <SelectItem value="financial">Financial Services</SelectItem>
//                       <SelectItem value="consumer">Consumer Discretionary</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Button variant="outline" size="sm" className="gap-2 bg-transparent">
//                     <Filter className="h-4 w-4" />
//                     Filter
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Symbol</TableHead>
//                     <TableHead>Shares</TableHead>
//                     <TableHead>Avg Cost</TableHead>
//                     <TableHead>Current Price</TableHead>
//                     <TableHead>Market Value</TableHead>
//                     <TableHead>Gain/Loss</TableHead>
//                     <TableHead>Day Change</TableHead>
//                     <TableHead>Weight</TableHead>
//                     <TableHead className="w-[50px]"></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {holdings.map((holding) => (
//                     <TableRow key={holding.symbol} className="hover:bg-muted/50">
//                       <TableCell>
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                             <span className="text-xs font-bold text-primary">{holding.symbol}</span>
//                           </div>
//                           <div>
//                             <div className="font-medium">{holding.symbol}</div>
//                             <div className="text-xs text-muted-foreground">{holding.name}</div>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>{holding.shares}</TableCell>
//                       <TableCell>${holding.avgCost.toFixed(2)}</TableCell>
//                       <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
//                       <TableCell className="font-medium">${holding.marketValue.toLocaleString()}</TableCell>
//                       <TableCell>
//                         <div className={holding.gainLoss > 0 ? "text-green-600" : "text-red-600"}>
//                           <div className="font-medium">
//                             {holding.gainLoss > 0 ? "+" : ""}${Math.abs(holding.gainLoss).toFixed(2)}
//                           </div>
//                           <div className="text-xs">
//                             ({holding.gainLoss > 0 ? "+" : ""}
//                             {holding.gainLossPercent.toFixed(2)}%)
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div
//                           className={`flex items-center gap-1 ${
//                             holding.dayChangePercent > 0 ? "text-green-600" : "text-red-600"
//                           }`}
//                         >
//                           {holding.dayChangePercent > 0 ? (
//                             <ArrowUpRight className="h-3 w-3" />
//                           ) : (
//                             <ArrowDownRight className="h-3 w-3" />
//                           )}
//                           <div>
//                             <div className="font-medium">
//                               {holding.dayChange > 0 ? "+" : ""}${Math.abs(holding.dayChange).toFixed(2)}
//                             </div>
//                             <div className="text-xs">
//                               ({holding.dayChangePercent > 0 ? "+" : ""}
//                               {holding.dayChangePercent.toFixed(2)}%)
//                             </div>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="secondary">{holding.weight.toFixed(1)}%</Badge>
//                       </TableCell>
//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem className="gap-2">
//                               <Eye className="h-4 w-4" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="gap-2">
//                               <Edit className="h-4 w-4" />
//                               Edit Position
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="gap-2 text-red-600">
//                               <Trash2 className="h-4 w-4" />
//                               Sell Position
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </div>
//       </SidebarInset>
//     </>
//   )
// }


"use client"

import React, { useMemo, useState, useCallback } from 'react';
import useSWR from "swr";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Download,
    Eye,
    Edit,
    Trash2,
    Loader2,
} from "lucide-react";

// UI Components (assuming these paths are correct in the actual project)
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



// Define the expected structure for a single holding from the API
interface HoldingData {
    id: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    dayChange?: number; // Day change in absolute value
    dayChangePercent?: number; // Day change in percentage
    asset: {
        symbol: string;
        name: string;
        logoUrl?: string;
        sector?: string; // Optional: include sector for filtering
    };
}


// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error("Failed to fetch portfolio data");
    }
    return res.json();
});



// --- Utility Functions ---

// Safely map and augment the raw API data
// const mapHoldingData = (rawHoldings: any[]): HoldingData[] => {
//     return rawHoldings.map(h => ({
//         id: h.id || crypto.randomUUID(), // Use provided ID or generate one
//         quantity: h.quantity || 0,
//         averagePrice: h.averagePrice || 0,
//         currentPrice: h.currentPrice || 0,
//         // Recalculate marketValue if not provided, for robustness
//         totalValue: (h.quantity || 0) * (h.currentPrice || 0), 
//         unrealizedPnL: h.unrealizedPnL || 0,
//         unrealizedPnLPercent: h.unrealizedPnLPercent || 0,
//         dayChange: h.dayChange || 0,
//         dayChangePercent: h.dayChangePercent || 0,
//         asset: {
//             symbol: h.asset?.symbol || "UNKNOWN",
//             name: h.asset?.name || h.asset?.symbol || "Unknown Asset",
//             logoUrl: h.asset?.logoUrl,
//             sector: h.asset?.sector || "N/A",
//         },
//     }));
// };



// Safely map and augment the raw API data
const mapHoldingData = (rawHoldings: any[]): HoldingData[] => {
    return rawHoldings.map(h => {
        const quantity = h.quantity || 0;
        // Assume raw API data contains valid avg price, or default to a non-zero mock for testing.
        const averagePrice = h.averagePrice || 0; 
        const currentPrice = h.currentPrice || 0;

        // Calculate Cost Basis and Market Value
        const costBasis = quantity * averagePrice;
        const totalValue = quantity * currentPrice; 
        
        // Calculate PnL values
        const unrealizedPnL = totalValue - costBasis;
        const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;
        
        // Use the API's day change values if present, or calculate/default to zero
        const dayChange = h.dayChange || 0;
        const dayChangePercent = h.dayChangePercent || 0;
        
        return {
            id: h.id || crypto.randomUUID(), 
            quantity: quantity,
            averagePrice: averagePrice,
            currentPrice: currentPrice,
            totalValue: totalValue, // Recalculated total value
            unrealizedPnL: unrealizedPnL, // CALCULATED
            unrealizedPnLPercent: unrealizedPnLPercent, // CALCULATED
            dayChange: dayChange,
            dayChangePercent: dayChangePercent,
            asset: {
                symbol: h.asset?.symbol || "UNKNOWN",
                name: h.asset?.name || h.asset?.symbol || "Unknown Asset",
                logoUrl: h.asset?.logoUrl,
                sector: h.asset?.sector || "N/A",
            },
        };
    });
};
// ---------------- HOLDINGS TABLE PROPS ----------------

interface HoldingsTableProps {
    holdings: HoldingData[];
    totalPortfolioValue: number; // Needed for allocation calculation
    searchQuery: string;
    onSearchChange: (val: string) => void;
    sectorFilter: string;
    onSectorFilterChange: (val: string) => void;
}

// --- Sub-Components ---

// Component for the main table of holdings
function HoldingsTable({ 
    holdings, 
    totalPortfolioValue, 
    searchQuery, 
    onSearchChange, 
    sectorFilter, 
    onSectorFilterChange 
}: HoldingsTableProps) {
    
    // Extract unique sectors for the filter dropdown based on all available data
    const uniqueSectors = useMemo(() => {
        const sectors = new Set<string>();
        // Check the original data if available, or just iterate through current holdings
        holdings.forEach(h => {
            if (h.asset.sector && h.asset.sector !== "N/A") {
                sectors.add(h.asset.sector);
            }
        });
        return Array.from(sectors).sort();
    }, [holdings]);
    
    if (holdings.length === 0 && (searchQuery || sectorFilter !== 'all')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Holdings</CardTitle>
                    <CardDescription>Detailed view of all your positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="mb-2">No holdings match your current search or filter criteria.</p>
                        <p className="text-sm">Try clearing your search term or selecting a different sector.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (holdings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Holdings</CardTitle>
                    <CardDescription>Detailed view of all your positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="mb-2">No holdings found.</p>
                        <p className="text-sm">Start trading to build your portfolio.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Your Holdings ({holdings.length})</CardTitle>
                        <CardDescription>Detailed view of all your positions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search Input - NOW BOUND TO STATE */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search holdings..." 
                                className="pl-8 w-64" 
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                        
                        {/* Sector Filter - NOW BOUND TO STATE */}
                        <Select value={sectorFilter} onValueChange={onSectorFilterChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Sectors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sectors</SelectItem>
                                {/* Dynamically generate sector options */}
                                {uniqueSectors.map((sector) => (
                                    <SelectItem key={sector} value={sector.toLowerCase()}>
                                        {sector}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead className="text-right">Avg Cost</TableHead>
                            <TableHead className="text-right">Current Price</TableHead>
                            <TableHead className="text-right">Market Value</TableHead>
                            <TableHead className="text-right">P&L (Total)</TableHead>
                            <TableHead className="text-right">Day Change</TableHead>
                            <TableHead className="text-right">Allocation</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holdings.map((holding) => {
                            const isTotalPositive = holding.unrealizedPnL >= 0;
                            const isDayPositive = holding.dayChangePercent && holding.dayChangePercent >= 0;
                            // FIX: Calculate allocation correctly using the total portfolio value
                            const allocationPercent = totalPortfolioValue > 0 
                                ? (holding.totalValue / totalPortfolioValue) * 100 
                                : 0;
                            
                            return (
                                <TableRow key={holding.id || holding.asset.symbol} className="hover:bg-muted/50">
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
                                            <div className="font-semibold">
                                                <span className="text-xs font-bold text-primary">{holding.asset.symbol}</span>
                                            </div>
                                            <div>
                                                {/* <div className="font-medium">{holding.asset.symbol}</div> */}
                                                <div className="text-xs text-muted-foreground">{holding.asset.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{holding.quantity.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${holding.averagePrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">${holding.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right">
                                        <div className={isTotalPositive ? "text-green-600" : "text-red-600"}>
                                            <div className="font-medium">
                                                {isTotalPositive ? "+" : ""}${Math.abs(holding.unrealizedPnL).toFixed(2)}
                                            </div>
                                            <div className="text-xs">
                                                ({isTotalPositive ? "+" : ""}{holding.unrealizedPnLPercent.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div
                                            className={`flex flex-col items-end gap-0.5 ${
                                                isDayPositive ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1 font-medium">
                                                {isDayPositive ? (
                                                    <ArrowUpRight className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDownRight className="h-3 w-3" />
                                                )}
                                                {isDayPositive ? "+" : ""}${Math.abs(holding.dayChange || 0).toFixed(2)}
                                            </div>
                                            <div className="text-xs">
                                                ({isDayPositive ? "+" : ""}{(holding.dayChangePercent || 0).toFixed(2)}%)
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">
                                            {allocationPercent.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edit Position
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                    Sell Position
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

// --- Main Component ---

export default function HoldingsPage() {
    // 1. Fetch data using SWR
    const { data, isLoading, error } = useSWR("/api/portfolio/overview", fetcher, {
        refreshInterval: 30000,
    });

    // --- State for Search and Filter (NEW) ---
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sectorFilter, setSectorFilter] = useState<string>("all");

    // 2. Map and Calculate data
    const holdings = useMemo(() => {
        return mapHoldingData(data?.holdings || []);
    }, [data]);

    const totalValue = useMemo(() => {
        return holdings.reduce((acc, curr) => acc + curr.totalValue, 0);
    }, [holdings]);
    
    // Note: Day change must be calculated by summing up the absolute $ change for all shares
    const totalDayChange = useMemo(() => {
        return holdings.reduce((acc, curr) => acc + (curr.dayChange || 0), 0); 
    }, [holdings]);

    // ** Filtered Holdings Logic (NEW) **
    const filteredHoldings = useMemo(() => {
        let currentHoldings = holdings;
        const lowerCaseSearchQuery = searchQuery.toLowerCase();

        // 1. Apply Search Filter
        if (lowerCaseSearchQuery) {
            currentHoldings = currentHoldings.filter(holding =>
                holding.asset.symbol.toLowerCase().includes(lowerCaseSearchQuery) ||
                holding.asset.name.toLowerCase().includes(lowerCaseSearchQuery)
            );
        }

        // 2. Apply Sector Filter
        if (sectorFilter && sectorFilter !== "all") {
            const lowerCaseSectorFilter = sectorFilter.toLowerCase();
            currentHoldings = currentHoldings.filter(holding =>
                holding.asset.sector?.toLowerCase() === lowerCaseSectorFilter
            );
        }

        return currentHoldings;
    }, [holdings, searchQuery, sectorFilter]);

    // Calculate Best Performer (based on day change percentage)
    const bestPerformer = useMemo(() => {
        if (holdings.length === 0) return null;
        return holdings.reduce((best, current) => {
            if (!best || (current.dayChangePercent || 0) > (best.dayChangePercent || 0)) {
                return current;
            }
            return best;
        }, holdings[0]);
    }, [holdings]);


    // 3. Handle loading and error states
    if (isLoading) {
        return (
            <SidebarInset>
                <div className="flex items-center justify-center h-full min-h-[500px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </SidebarInset>
        );
    }
    
    if (error) {
        return (
            <SidebarInset>
                <div className="p-4 text-center text-red-600">
                    <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                    <p>Could not fetch portfolio holdings. Please try again later.</p>
                </div>
            </SidebarInset>
        );
    }

    // Determine the overall total gain/loss percentage for the placeholder card (using total PnL from the sum)
    // NOTE: This calculation is often complex in real financial apps but simplified here.
    const initialCostBasis = holdings.reduce((acc, curr) => acc + (curr.quantity * curr.averagePrice), 0);
    const totalGainLoss = totalValue - initialCostBasis;
    const totalGainLossPercent = initialCostBasis > 0 ? (totalGainLoss / initialCostBasis) * 100 : 0;
    const isTotalPortfolioPositive = totalGainLoss >= 0;

    return (
        <>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-sidebar-border" />
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h1 className="text-lg font-semibold">Holdings</h1>
                        </div>
                    </div>
                    <div className="ml-auto px-4 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Position
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Card 1: Total Holdings */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{holdings.length}</div>
                                <p className="text-xs text-muted-foreground">Active positions</p>
                            </CardContent>
                        </Card>
                        
                        {/* Card 2: Total Value */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className={`text-xs flex items-center gap-1 ${isTotalPortfolioPositive ? "text-green-600" : "text-red-600"}`}>
                                    {isTotalPortfolioPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {isTotalPortfolioPositive ? "+" : ""}${Math.abs(totalGainLoss).toFixed(2)} ({isTotalPortfolioPositive ? "+" : ""}{totalGainLossPercent.toFixed(2)}%)
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Card 3: Day's Change (Est) */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Day's Change (Est)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${totalDayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {totalDayChange >= 0 ? "+" : ""}${totalDayChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className={`text-xs flex items-center gap-1 ${totalDayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {totalDayChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {totalDayChange >= 0 ? "+" : ""}{((totalDayChange / totalValue) * 100).toFixed(2)}% today
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 4: Best Performer */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Best Performer (Day)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bestPerformer ? (
                                    <>
                                        <div className="text-2xl font-bold">{bestPerformer.asset.symbol}</div>
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <ArrowUpRight className="h-3 w-3" />
                                            +{(bestPerformer.dayChangePercent || 0).toFixed(2)}% today
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Holdings Table */}
                    <HoldingsTable 
                        holdings={filteredHoldings} 
                        totalPortfolioValue={totalValue}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sectorFilter={sectorFilter}
                        onSectorFilterChange={setSectorFilter}
                    />
                </div>
            </SidebarInset>
        </>
    );
}



