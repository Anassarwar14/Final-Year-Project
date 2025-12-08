"use client";

import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface StockSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStock: (symbol: string) => void;
}

export function StockSearchCommand({ open, onOpenChange, onSelectStock }: StockSearchCommandProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search with useEffect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!search || search.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Searching for:", search);
        const response = await fetch(`/api/trading/market/search?q=${encodeURIComponent(search)}`);
        console.log("Search response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Search results:", data);
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSelect = (symbol: string) => {
    onSelectStock(symbol);
    onOpenChange(false);
    setSearch("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogTitle className="sr-only">Search Stocks</DialogTitle>
        <Command className="rounded-lg border-none">
          <CommandInput
            placeholder="Search stocks by symbol or company name..."
            value={search}
            onValueChange={setSearch}
            className="border-b"
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <div className="animate-pulse">Searching...</div>
              </div>
            )}
            {!loading && search.length >= 2 && results.length === 0 && (
              <CommandEmpty>No stocks found. Try a different search term.</CommandEmpty>
            )}
            {!loading && results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.slice(0, 10).map((result) => (
                  <CommandItem
                    key={result.symbol}
                    value={result.symbol}
                    onSelect={() => handleSelect(result.symbol)}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{result.displaySymbol || result.symbol}</span>
                        <span className="text-xs text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded">
                          {result.type}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">{result.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!search && (
              <div className="py-12 text-center space-y-2">
                <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">
                  Search for stocks by symbol (AAPL, MSFT, GOOGL) or company name
                </p>
                <p className="text-xs text-muted-foreground">
                  Start typing at least 2 characters...
                </p>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
