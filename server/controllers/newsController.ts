// import { Request, Response } from "express";
// import * as newsService from "../services/newsServices";

// export const getAllNews = async (req: Request, res: Response) => {
//   try {
//     const data = await newsService.fetchAllNews();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching news" });
//   }
// };

// export const getNewsByCategory = async (req: Request, res: Response) => {
//   try {
//     const { category } = req.params;
//     const data = await newsService.fetchNewsByCategory(category);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching category news" });
//   }
// };
import { NextResponse } from "next/server";
import { marketDataService } from "../services/marketDataService";

// Helper to validate standard Finnhub categories
const VALID_CATEGORIES = ["general", "forex", "crypto", "merger"];

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category.toLowerCase();
    let data;

    // Logic: If it's a known category, fetch market news.
    // If not, assume it is a Company Ticker (like 'AAPL') and fetch company news.
    if (VALID_CATEGORIES.includes(category)) {
      data = await marketDataService.getMarketNews(category);
    } else {
      // Calculate dates for company news (last 7 days)
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch company specific news (e.g., if category is "AAPL")
      data = await marketDataService.getCompanyNews(category.toUpperCase(), from, to);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(`Error fetching news for category ${params.category}:`, err);
    return NextResponse.json(
      { error: "Error fetching category news" },
      { status: 500 }
    );
  }
}

