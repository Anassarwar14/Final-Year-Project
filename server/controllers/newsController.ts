import { Request, Response } from 'express';
import * as newsService from '../services/newsServices';
import { NewsSentiment } from '@prisma/client'; // Import enum from Prisma

/**
 * 1. Get All News (for news/page.tsx)
 * -----------------------------------
 * Fetches a paginated, sorted, and filtered list of news articles.
 * This is the main endpoint for your primary news feed.
 *
 * Query Params:
 * - page: number (for pagination)
 * - limit: number (articles per page)
 * - sortBy: string (e.g., "publishedAt", "sentiment")
 * - sortOrder: 'asc' | 'desc'
 * - sentiment: NewsSentiment (e.g., "POSITIVE", "NEGATIVE")
 * - assetSymbol: string (e.g., "AAPL", to filter by related asset)
 * - startDate: ISO Date string
 * - endDate: ISO Date string
 */
export const getAllNews = async (req: Request, res: Response) => {
  try {
    // --- Pagination ---
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // --- Sorting ---
    const sortBy = (req.query.sortBy as string) || 'publishedAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    // --- Filtering ---
    const filters = {
      sentiment: req.query.sentiment as NewsSentiment | undefined,
      assetSymbol: req.query.assetSymbol as string | undefined,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const result = await newsService.getAllNews({
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching news articles',
      error: (error as Error).message,
    });
  }
};

/* 2. Get Single News Article (for news/[articleId]/page.tsx - dynamic route)
 * -------------------------------------------------------------------------
 * Fetches a single news article by its unique ID.
 * URL Param:
 * - id: string (the article's CUID)*/

export const getNewsArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Article ID is required' });
    }

    const article = await newsService.getNewsById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching news article',
      error: (error as Error).message,
    });
  }
};

/**
 * 3. Get News Analytics (for news/analytics/page.tsx)
 * ---------------------------------------------------
 * Fetches aggregated analytics data for the news.
 * This could include sentiment breakdown, top-mentioned assets, etc.
 *
 * Query Params:
 * - assetSymbol: string (optional, to scope analytics to one asset)
 * - dateRange: '24h' | '7d' | '30d' (optional)
 */
export const getNewsAnalytics = async (req: Request, res: Response) => {
  try {
    const { assetSymbol, dateRange } = req.query;

    const analyticsData = await newsService.getNewsAnalytics({
      assetSymbol: assetSymbol as string | undefined,
      dateRange: dateRange as '24h' | '7d' | '30d' | undefined,
    });

    res.status(200).json(analyticsData);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching news analytics',
      error: (error as Error).message,
    });
  }
};

/**
 * 4. Get News for Calendar (for news/calendar/page.tsx)
 * -----------------------------------------------------
 * Fetches news data grouped by day for a specific month,
 * ideal for populating a calendar view.
 *
 * Query Params:
 * - month: number (1-12)
 * - year: number (e.g., 2025)
 */
export const getNewsCalendarData = async (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!month || !year || month < 1 || month > 12) {
      return res
        .status(400)
        .json({ message: 'Valid month and year are required' });
    }

    const calendarData = await newsService.getNewsByDayForMonth(month, year);

    res.status(200).json(calendarData);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching news calendar data',
      error: (error as Error).message,
    });
  }
};

/**
 * 5. Trigger News Fetch (Internal/Admin)
 * --------------------------------------
 * A protected endpoint to manually trigger the news service to
 * fetch new articles from external APIs (Finnhub, News API).
 * This should be protected by an admin authentication middleware.
 */
export const triggerNewsFetch = async (req: Request, res: Response) => {
  try {
    // In a real app, you would add auth middleware here
    // to ensure only an admin can call this.
    // e.g., if (req.user.role !== 'ADMIN') return res.status(403).json(...)

    const result = await newsService.fetchAndSaveNews();

    res.status(201).json({
      ...result,
      message: result.message || 'News fetch initiated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error triggering news fetch',
      error: (error as Error).message,
    });
  }
};