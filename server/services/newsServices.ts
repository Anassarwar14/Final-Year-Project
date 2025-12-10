// import { pool } from "../config/db";

// export const fetchAllNews = async () => {
//   const result = await pool.query("SELECT * FROM news ORDER BY created_at DESC");
//   return result.rows;
// };

// export const fetchNewsByCategory = async (category: string) => {
//   const result = await pool.query("SELECT * FROM news WHERE category = $1", [category]);
//   return result.rows;
// };


// services/newsServices.ts
import { marketDataService, NewsArticle } from "./marketDataService";

// Helper to validate Finnhub categories
const VALID_CATEGORIES = ["general", "forex", "crypto", "merger"];

export const fetchAllNews = async (): Promise<NewsArticle[]> => {
  // Default to general market news
  return await marketDataService.getMarketNews("general");
};

export const fetchNewsByCategory = async (category: string): Promise<NewsArticle[]> => {
  const normalizedCategory = category.toLowerCase();

  // If the category is valid in Finnhub, fetch market news
  if (VALID_CATEGORIES.includes(normalizedCategory)) {
    return await marketDataService.getMarketNews(normalizedCategory);
  }
  
  // If it's a company ticker (e.g., AAPL), fetch company specific news
  // You might want to add logic here to distinguish between categories and tickers
  // For now, if it's not a standard category, we return general news 
  // or you can implement logic to search company news if the category matches a symbol
  return await marketDataService.getMarketNews("general");
};
