"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

type Holding = {
  id: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  asset: {
    symbol: string;
    name: string;
  };
};

type HoldingsResponse = {
  portfolioId: string;
  holdings: Holding[];
};

type HoldingForm = {
  symbol: string;
  quantity: string;
  buyPrice: string;
};

const emptyForm: HoldingForm = { symbol: "", quantity: "", buyPrice: "" };

export default function HoldingsPage() {
  const { data, isLoading, mutate } = useSWR<HoldingsResponse>("/api/portfolio/holdings", fetcher);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HoldingForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const holdings = data?.holdings || [];
  const toNumber = (value: number | string) => (typeof value === "number" ? value : Number(value));

  const totals = useMemo(() => {
    const invested = holdings.reduce((sum, h) => sum + toNumber(h.averageBuyPrice) * toNumber(h.quantity), 0);
    const current = holdings.reduce((sum, h) => sum + toNumber(h.totalValue), 0);
    const pnl = current - invested;
    return { invested, current, pnl };
  }, [holdings]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (holding: Holding) => {
    setEditingId(holding.id);
    setForm({
      symbol: holding.asset.symbol,
      quantity: String(holding.quantity),
      buyPrice: String(holding.averageBuyPrice),
    });
    setError(null);
    setFormOpen(true);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        symbol: form.symbol.trim().toUpperCase(),
        quantity: Number(form.quantity),
        buyPrice: Number(form.buyPrice),
      };

      const endpoint = editingId ? `/api/portfolio/holdings/${editingId}` : "/api/portfolio/holdings";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed");
      }

      await mutate();
      setFormOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (holdingId: string) => {
    if (!confirm("Delete this holding?") ) return;

    const res = await fetch(`/api/portfolio/holdings/${holdingId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      await mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-[320px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Holdings</h1>
          <p className="text-muted-foreground mt-1">Manage your stock positions</p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Holding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Holding" : "Add Holding"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Symbol</label>
                <Input
                  value={form.symbol}
                  onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
                  placeholder="AAPL"
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity (No. of stocks)</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Buying Price</label>
                <Input
                  type="number"
                  value={form.buyPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
                  placeholder="150"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Cost basis</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Live market value</p>
          </CardContent>
        </Card>
        <Card className={totals.pnl >= 0 ? "border-positive/30" : "border-negative/30"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.pnl >= 0 ? "text-positive" : "text-negative"}`}>
              {totals.pnl >= 0 ? "+" : ""}${totals.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Across all holdings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No holdings yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Buy Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.id}>
                    <TableCell className="font-medium">{holding.asset.symbol}</TableCell>
                    <TableCell>{holding.asset.name}</TableCell>
                    <TableCell className="text-right">{toNumber(holding.quantity)}</TableCell>
                    <TableCell className="text-right">${toNumber(holding.averageBuyPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${toNumber(holding.currentPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      ${toNumber(holding.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right ${toNumber(holding.unrealizedPnL) >= 0 ? "text-positive" : "text-negative"}`}>
                      {toNumber(holding.unrealizedPnL) >= 0 ? "+" : ""}${toNumber(holding.unrealizedPnL).toFixed(2)}
                      <div className="text-xs text-muted-foreground">
                        {toNumber(holding.unrealizedPnL) >= 0 ? "+" : ""}{toNumber(holding.unrealizedPnLPercent).toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(holding)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(holding.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
