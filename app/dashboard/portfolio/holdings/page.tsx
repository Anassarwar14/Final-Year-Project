"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  TrendingUp,
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
} from "lucide-react"

// Extended holdings data
const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    shares: 50,
    avgCost: 165.2,
    currentPrice: 185.92,
    marketValue: 9296,
    totalCost: 8260,
    gainLoss: 1036,
    gainLossPercent: 12.54,
    dayChange: 2.34,
    dayChangePercent: 1.27,
    weight: 15.97,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    shares: 40,
    avgCost: 340.15,
    currentPrice: 378.85,
    marketValue: 15154,
    totalCost: 13606,
    gainLoss: 1548,
    gainLossPercent: 11.38,
    dayChange: 5.67,
    dayChangePercent: 1.52,
    weight: 26.04,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    shares: 25,
    avgCost: 148.9,
    currentPrice: 142.56,
    marketValue: 3564,
    totalCost: 3722.5,
    gainLoss: -158.5,
    gainLossPercent: -4.26,
    dayChange: -1.23,
    dayChangePercent: -0.86,
    weight: 6.12,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Consumer Discretionary",
    shares: 30,
    avgCost: 220.75,
    currentPrice: 248.5,
    marketValue: 7455,
    totalCost: 6622.5,
    gainLoss: 832.5,
    gainLossPercent: 12.57,
    dayChange: 8.92,
    dayChangePercent: 3.72,
    weight: 12.81,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    shares: 15,
    avgCost: 820.4,
    currentPrice: 875.28,
    marketValue: 13129,
    totalCost: 12306,
    gainLoss: 823,
    gainLossPercent: 6.69,
    dayChange: 12.45,
    dayChangePercent: 1.44,
    weight: 22.56,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Financial Services",
    shares: 35,
    avgCost: 142.8,
    currentPrice: 158.45,
    marketValue: 5545.75,
    totalCost: 4998,
    gainLoss: 547.75,
    gainLossPercent: 10.96,
    dayChange: 1.25,
    dayChangePercent: 0.79,
    weight: 9.53,
  },
]

export default function HoldingsPage() {
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Active positions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$54,143</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +$4,628 (+9.34%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Day's Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$1,240</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +2.34% today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">TSLA</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +3.72% today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Holdings</CardTitle>
                  <CardDescription>Detailed view of all your positions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search holdings..." className="pl-8 w-64" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="consumer">Consumer Discretionary</SelectItem>
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
                    <TableHead>Symbol</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Avg Cost</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                    <TableHead>Day Change</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => (
                    <TableRow key={holding.symbol} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{holding.symbol}</span>
                          </div>
                          <div>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-xs text-muted-foreground">{holding.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{holding.shares}</TableCell>
                      <TableCell>${holding.avgCost.toFixed(2)}</TableCell>
                      <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${holding.marketValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className={holding.gainLoss > 0 ? "text-green-600" : "text-red-600"}>
                          <div className="font-medium">
                            {holding.gainLoss > 0 ? "+" : ""}${Math.abs(holding.gainLoss).toFixed(2)}
                          </div>
                          <div className="text-xs">
                            ({holding.gainLoss > 0 ? "+" : ""}
                            {holding.gainLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${
                            holding.dayChangePercent > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {holding.dayChangePercent > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <div>
                            <div className="font-medium">
                              {holding.dayChange > 0 ? "+" : ""}${Math.abs(holding.dayChange).toFixed(2)}
                            </div>
                            <div className="text-xs">
                              ({holding.dayChangePercent > 0 ? "+" : ""}
                              {holding.dayChangePercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{holding.weight.toFixed(1)}%</Badge>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
