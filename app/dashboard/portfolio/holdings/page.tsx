"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";

type Holding = {
  id: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  asset: {
    symbol: string;
    name: string;
    logoUrl?: string;
    sector?: string;
  };
};

type OverviewPayload = {
  profile?: { totalValue?: number; cashBalance?: number };
  holdings?: any[];
};

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch holdings");
    return res.json();
  });

function mapHoldings(raw: any[] = []): Holding[] {
  return raw.map((item) => {
    const symbol = String(item.asset?.symbol || item.symbol || "UNK");
    const quantity = Number(item.quantity || 0);
    const averagePrice = Number(item.averagePrice ?? item.averageBuyPrice ?? 0);
    const currentPrice = Number(item.currentPrice ?? 0);
    const totalValue = Number(item.totalValue ?? quantity * currentPrice);
    const unrealizedPnL = Number(item.unrealizedPnL ?? totalValue - quantity * averagePrice);
    const unrealizedPnLPercent = Number(
      item.unrealizedPnLPercent ??
        (quantity * averagePrice > 0 ? (unrealizedPnL / (quantity * averagePrice)) * 100 : 0)
    );

    const dayChangePercent = Number(item.quote?.dp ?? item.dayChangePercent ?? 0);
    const dayChange = Number(item.dayChange ?? totalValue * (dayChangePercent / 100));

    return {
      id: String(item.id || `${symbol}-${quantity}-${averagePrice}`),
      quantity,
      averagePrice,
      currentPrice,
      totalValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      dayChange,
      dayChangePercent,
      asset: {
        symbol,
        name: String(item.asset?.name || item.asset?.symbol || "Unknown Asset"),
        logoUrl: item.asset?.logoUrl,
        sector: item.asset?.sector || item.asset?.exchange || "Unknown",
      },
    };
  });
}

async function apiJson(url: string, method: string, body?: any) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function HoldingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newAvg, setNewAvg] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editHolding, setEditHolding] = useState<Holding | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editAvg, setEditAvg] = useState("");

  const { data, isLoading, error, mutate } = useSWR<OverviewPayload>("/api/portfolio/overview", fetcher, {
    refreshInterval: 30000,
  });

  const holdings = useMemo(() => mapHoldings(data?.holdings || []), [data?.holdings]);

  const sectors = useMemo(
    () => Array.from(new Set(holdings.map((h) => h.asset.sector || "Unknown"))).sort(),
    [holdings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return holdings.filter((h) => {
      const byText = !q || h.asset.symbol.toLowerCase().includes(q) || h.asset.name.toLowerCase().includes(q);
      const bySector = sector === "all" || (h.asset.sector || "unknown").toLowerCase() === sector;
      return byText && bySector;
    });
  }, [holdings, search, sector]);

  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const costBasis = holdings.reduce((sum, h) => sum + h.quantity * h.averagePrice, 0);
  const totalPnL = totalValue - costBasis;
  const totalPnLPct = costBasis > 0 ? (totalPnL / costBasis) * 100 : 0;
  const dayChangeTotal = holdings.reduce((sum, h) => sum + h.dayChange, 0);

  const bestPerformer = holdings.reduce<Holding | null>((best, current) => {
    if (!best) return current;
    return current.dayChangePercent > best.dayChangePercent ? current : best;
  }, null);

  const openEdit = (h: Holding) => {
    setAddOpen(false);
    setEditHolding(h);
    setEditQty(String(h.quantity));
    setEditAvg(String(h.averagePrice));
    setEditOpen(true);
  };

  const addPosition = async () => {
    const symbol = newSymbol.trim().toUpperCase();
    const quantity = Number(newQty);
    const averagePrice = Number(newAvg);

    if (!symbol || quantity <= 0 || averagePrice <= 0) {
      toast.error("Enter valid symbol, quantity, and average price.");
      return;
    }

    setAddSaving(true);
    try {
      await apiJson("/api/portfolio/holdings", "POST", { symbol, quantity, averagePrice });
      setAddOpen(false);
      setNewSymbol("");
      setNewQty("");
      setNewAvg("");
      await mutate();
      toast.success(`${symbol} added to portfolio`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add position");
    } finally {
      setAddSaving(false);
    }
  };

  const updatePosition = async () => {
    if (!editHolding) return;

    const quantity = Number(editQty);
    const averagePrice = Number(editAvg);
    if (quantity <= 0 || averagePrice <= 0) {
      toast.error("Quantity and average price must be greater than 0.");
      return;
    }

    setEditSaving(true);
    try {
      await apiJson(`/api/portfolio/holdings/${editHolding.id}`, "PATCH", {
        quantity,
        averagePrice,
      });
      setEditOpen(false);
      setEditHolding(null);
      await mutate();
      toast.success(`${editHolding.asset.symbol} updated`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update position");
    } finally {
      setEditSaving(false);
    }
  };

  const removePosition = async (h: Holding) => {
    if (!confirm(`Remove ${h.asset.symbol} from your portfolio?`)) return;

    try {
      await apiJson(`/api/portfolio/holdings/${h.id}`, "DELETE");
      await mutate();
      toast.success(`${h.asset.symbol} removed`);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove position");
    }
  };

  if (isLoading) {
    return (
      <SidebarInset>
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset>
        <div className="p-6 text-center text-red-600">
          <h2 className="text-xl font-semibold">Unable to load holdings</h2>
          <p className="mt-1 text-sm">Please refresh and try again.</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-chart-2/10 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Portfolio Holdings</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-[radial-gradient(circle_at_top_left,_hsl(var(--chart-1)/0.08),_transparent_40%),radial-gradient(circle_at_bottom_right,_hsl(var(--chart-2)/0.08),_transparent_35%)] p-4 pt-0">
        {addOpen ? (
          <Card className="border-primary/30 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle>Add Position</CardTitle>
              <CardDescription>Add a holding to your real portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" placeholder="AAPL" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min="0" step="0.0001" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="avg">Average Buy Price</Label>
                <Input id="avg" type="number" min="0" step="0.0001" value={newAvg} onChange={(e) => setNewAvg(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addSaving}>Cancel</Button>
              <Button onClick={addPosition} disabled={addSaving}>{addSaving ? "Saving..." : "Add Position"}</Button>
            </CardFooter>
          </Card>
        ) : null}

        {editOpen && editHolding ? (
          <Card className="border-primary/30 bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle>Edit Position ({editHolding.asset.symbol})</CardTitle>
              <CardDescription>Update quantity and average price for this holding.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="edit-qty">Quantity</Label>
                <Input id="edit-qty" type="number" min="0" step="0.0001" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-avg">Average Buy Price</Label>
                <Input id="edit-avg" type="number" min="0" step="0.0001" value={editAvg} onChange={(e) => setEditAvg(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
              <Button onClick={updatePosition} disabled={editSaving}>{editSaving ? "Saving..." : "Update Position"}</Button>
            </CardFooter>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20 bg-card/90 backdrop-blur">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Open Positions</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{holdings.length}</div><p className="text-xs text-muted-foreground">Active holdings</p></CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/90 backdrop-blur">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Market Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className={`text-xs ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toFixed(2)} ({totalPnL >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/90 backdrop-blur">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dayChangeTotal >= 0 ? "text-green-600" : "text-red-600"}`}>{dayChangeTotal >= 0 ? "+" : ""}${dayChangeTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimated from quote deltas</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/90 backdrop-blur">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Best Mover</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestPerformer?.asset.symbol || "-"}</div>
              <p className="text-xs text-green-600">
                {bestPerformer ? `${bestPerformer.dayChangePercent >= 0 ? "+" : ""}${bestPerformer.dayChangePercent.toFixed(2)}% today` : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-card/90 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Positions</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your real portfolio holdings directly from this table.</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by symbol or name"
                    className="w-full pl-8 sm:w-64"
                  />
                </div>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All sectors" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sectors</SelectItem>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!filtered.length ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                <Sparkles className="mx-auto mb-2 h-5 w-5" />
                <p className="font-medium">No holdings match your filters.</p>
                <p className="text-sm">Try a different symbol/sector filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">P&amp;L</TableHead>
                    <TableHead className="text-right">Day</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h) => {
                    const pnlUp = h.unrealizedPnL >= 0;
                    const dayUp = h.dayChangePercent >= 0;
                    const weight = totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0;
                    return (
                      <TableRow key={h.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {h.asset.logoUrl ? (
                              <img
                                src={h.asset.logoUrl}
                                alt={h.asset.symbol}
                                className="h-8 w-8 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : null}
                            <div>
                              <div className="font-semibold">{h.asset.symbol}</div>
                              <div className="text-xs text-muted-foreground">{h.asset.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{h.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${h.averagePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${h.currentPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">
                          <div className={pnlUp ? "text-green-600" : "text-red-600"}>
                            <div className="font-medium">{pnlUp ? "+" : ""}${Math.abs(h.unrealizedPnL).toFixed(2)}</div>
                            <div className="text-xs">({pnlUp ? "+" : ""}{h.unrealizedPnLPercent.toFixed(2)}%)</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`inline-flex items-center gap-1 ${dayUp ? "text-green-600" : "text-red-600"}`}>
                            {dayUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span>{dayUp ? "+" : ""}{h.dayChangePercent.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><Badge variant="secondary">{weight.toFixed(1)}%</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(h)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Position
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const prompt = `Analyze my ${h.asset.symbol} position and suggest hold/buy/sell with risk-aware sizing.`;
                                  await navigator.clipboard.writeText(prompt);
                                  toast.success("Analysis prompt copied. Opening advisor chat.");
                                  router.push("/dashboard/chat");
                                }}
                              >
                                Analyze In Advisor
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => removePosition(h)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Position
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

    </SidebarInset>
  );
}
