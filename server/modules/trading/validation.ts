import { z } from "zod";

// Initialize simulator profile
export const initializeProfileSchema = z.object({});

// Execute trade
export const executeTradeSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  type: z.enum(["BUY", "SELL"], {
    required_error: "Transaction type is required",
  }),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val > 0, "Quantity must be positive"),
  pricePerUnit: z
    .number()
    .positive("Price must be positive")
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val > 0, "Price must be positive"),
});

// Get transaction history with filters
export const getHistorySchema = z.object({
  assetId: z.string().optional(),
  type: z.enum(["BUY", "SELL"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .or(z.number())
    .optional()
    .default(20),
});

// Create snapshot
export const createSnapshotSchema = z.object({
  date: z.string().datetime().optional(),
});

// Watchlist operations
export const addToWatchlistSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  priceAlertTarget: z
    .number()
    .positive()
    .optional()
    .or(z.string().transform((val) => parseFloat(val))),
  priceAlertEnabled: z.boolean().optional().default(false),
});

export const updateWatchlistSchema = z.object({
  priceAlertTarget: z
    .number()
    .positive()
    .optional()
    .or(z.string().transform((val) => parseFloat(val))),
  priceAlertEnabled: z.boolean().optional(),
});
