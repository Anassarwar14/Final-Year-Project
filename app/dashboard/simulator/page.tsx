"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Search } from "lucide-react"

// Mock market data
const generateMarketData = (symbol: string, basePrice: number) => {
  const data = []
  let price = basePrice
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.5) * 10
    price += change
    data.push({
      time: `${i + 1}d`,
      price: Math.max(price, 1),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    })
  }
  return data
}

const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    data: generateMarketData("AAPL", 175),
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2847.63,
    change: -15.23,
    changePercent: -0.53,
    data: generateMarketData("GOOGL", 2847),
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.85,
    change: 4.12,
    changePercent: 1.1,
    data: generateMarketData("MSFT", 378),
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.5,
    change: -8.75,
    changePercent: -3.4,
    data: generateMarketData("TSLA", 248),
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 3247.15,
    change: 12.45,
    changePercent: 0.38,
    data: generateMarketData("AMZN", 3247),
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.28,
    change: 23.67,
    changePercent: 2.78,
    data: generateMarketData("NVDA", 875),
  },
]

export default function TradingSimulator() {
  const [selectedStock, setSelectedStock] = useState(stocks[0])
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [orderPrice, setOrderPrice] = useState("")
  const [virtualBalance, setVirtualBalance] = useState(100000)
  const [positions, setPositions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleTrade = () => {
    const qty = Number.parseInt(quantity)
    const price = Number.parseFloat(orderPrice) || selectedStock.price
    const totalCost = qty * price

    if (orderType === "buy" && totalCost <= virtualBalance) {
      setVirtualBalance((prev) => prev - totalCost)
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === selectedStock.symbol)
        if (existing) {
          return prev.map((p) =>
            p.symbol === selectedStock.symbol
              ? {
                  ...p,
                  quantity: p.quantity + qty,
                  avgPrice: (p.avgPrice * p.quantity + totalCost) / (p.quantity + qty),
                }
              : p,
          )
        } else {
          return [...prev, { symbol: selectedStock.symbol, name: selectedStock.name, quantity: qty, avgPrice: price }]
        }
      })
    } else if (orderType === "sell") {
      const position = positions.find((p) => p.symbol === selectedStock.symbol)
      if (position && position.quantity >= qty) {
        setVirtualBalance((prev) => prev + totalCost)
        setPositions((prev) =>
          prev
            .map((p) => (p.symbol === selectedStock.symbol ? { ...p, quantity: p.quantity - qty } : p))
            .filter((p) => p.quantity > 0),
        )
      }
    }

    setQuantity("")
    setOrderPrice("")
  }

  const portfolioValue = positions.reduce((total, position) => {
    const currentStock = stocks.find((s) => s.symbol === position.symbol)
    return total + position.quantity * (currentStock?.price || 0)
  }, 0)

  const totalValue = virtualBalance + portfolioValue
  const totalPnL = totalValue - 100000

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${virtualBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${portfolioValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-gradient-to-br ${totalPnL >= 0 ? "from-green-500/5 to-green-500/10 border-green-500/20" : "from-red-500/5 to-red-500/10 border-red-500/20"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Market Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedStock.symbol}</CardTitle>
                  <CardDescription>{selectedStock.name}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${selectedStock.price}</div>
                  <div
                    className={`flex items-center gap-1 ${selectedStock.change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {selectedStock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>
                      {selectedStock.change >= 0 ? "+" : ""}
                      {selectedStock.change} ({selectedStock.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedStock.data}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stock List */}
          <Card>
            <CardHeader>
              <CardTitle>Market Watchlist</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStock.symbol === stock.symbol
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stock.price}</div>
                      <div
                        className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stock.changePercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
              <CardDescription>Trade {selectedStock.symbol}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "buy" | "sell")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (Optional)</label>
                  <Input
                    type="number"
                    placeholder={`Market price: $${selectedStock.price}`}
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Estimated Total: $
                  {(
                    (Number.parseInt(quantity) || 0) * (Number.parseFloat(orderPrice) || selectedStock.price)
                  ).toLocaleString()}
                </div>
              </div>

              <Button
                onClick={handleTrade}
                disabled={!quantity || Number.parseInt(quantity) <= 0}
                className={`w-full ${orderType === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {orderType === "buy" ? "Buy" : "Sell"} {selectedStock.symbol}
              </Button>
            </CardContent>
          </Card>

          {/* Current Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No positions yet. Start trading to build your portfolio!
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.map((position) => {
                    const currentStock = stocks.find((s) => s.symbol === position.symbol)
                    const currentValue = position.quantity * (currentStock?.price || 0)
                    const costBasis = position.quantity * position.avgPrice
                    const pnl = currentValue - costBasis
                    const pnlPercent = (pnl / costBasis) * 100

                    return (
                      <div key={position.symbol} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{position.symbol}</div>
                            <div className="text-sm text-muted-foreground">{position.quantity} shares</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${currentValue.toLocaleString()}</div>
                            <div className={`text-sm ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
