import { PrismaClient, NewsSentiment, Prisma } from '@prisma/client';
import axios from 'axios'; // For making HTTP requests to external APIs

// Initialize Prisma Client
const prisma = new PrismaClient();

// --- Type Definitions for Options ---

type GetAllNewsOptions = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: {
    sentiment?: NewsSentiment;
    assetSymbol?: string;
    startDate?: Date;
    endDate?: Date;
  };
};

type GetNewsAnalyticsOptions = {
  assetSymbol?: string;
  dateRange?: '24h' | '7d' | '30d';
};

// --- Helper Functions ---

/**
 * Calculates the start date based on a date range string.
 */
const getDateRangeStart = (
  dateRange: '24h' | '7d' | '30d',
): Date => {
  const now = new Date();
  switch (dateRange) {
    case '24h':
      now.setDate(now.getDate() - 1);
      break;
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
  }
  return now;
};

// --- Service Functions ---

/**
 * 1. Get All News (Paginated, Filtered, Sorted)
 * Called by: `getAllNews` controller
 * Powers: `news/page.tsx`
 */
export const getAllNews = async (options: GetAllNewsOptions) => {
  const { page, limit, sortBy, sortOrder, filters } = options;

  const skip = (page - 1) * limit;
  const take = limit;

  // Build the dynamic WHERE clause for filtering
  const where: Prisma.NewsArticleWhereInput = {
    sentiment: filters.sentiment, // Direct enum filter
    publishedAt: {
      gte: filters.startDate, // 'Greater than or equal to'
      lte: filters.endDate, // 'Less than or equal to'
    },
    // Relational filter: Find articles where *some* related asset
    // has the specified symbol.
    ...(filters.assetSymbol && {
      relatedAssets: {
        some: {
          symbol: filters.assetSymbol,
        },
      },
    }),
  };

  // Build the dynamic ORDER BY clause
  const orderBy = {
    [sortBy]: sortOrder,
  };

  // We use a transaction to get both the data and the total count
  // in a single database round-trip for efficient pagination.
  const [articles, totalCount] = await prisma.$transaction([
    prisma.newsArticle.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        relatedAssets: {
          select: { symbol: true, name: true, logoUrl: true }, // Only include what's needed
        },
      },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return {
    data: articles,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * 2. Get Single News Article by ID
 * Called by: `getNewsArticleById` controller
 * Powers: `news/[articleId]/page.tsx` (dynamic route)
 */
export const getNewsById = async (id: string) => {
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: {
      // Include the related assets for this article
      relatedAssets: true,
    },
  });
  return article;
};

/**
 * 3. Get News Analytics
 * Called by: `getNewsAnalytics` controller
 * Powers: `news/analytics/page.tsx`
 */
export const getNewsAnalytics = async (
  options: GetNewsAnalyticsOptions,
) => {
  const { assetSymbol, dateRange } = options;

  // Build the WHERE clause for analytics
  const where: Prisma.NewsArticleWhereInput = {
    ...(assetSymbol && {
      relatedAssets: { some: { symbol: assetSymbol } },
    }),
    ...(dateRange && {
      publishedAt: {
        gte: getDateRangeStart(dateRange),
      },
    }),
  };

  // 1. Get sentiment breakdown (e.g., { POSITIVE: 50, NEGATIVE: 20, ... })
  const sentimentBreakdown = await prisma.newsArticle.groupBy({
    by: ['sentiment'],
    _count: {
      sentiment: true,
    },
    where,
  });

  // Format the sentiment data
  const sentiments = sentimentBreakdown.reduce(
    (acc, S) => {
      acc[S.sentiment] = S._count.sentiment;
      return acc;
    },
    {} as Record<NewsSentiment, number>,
  );

  // 2. Get top-mentioned assets (only if no specific asset is selected)
  let topAssets = null;
  if (!assetSymbol) {
    topAssets = await prisma.asset.findMany({
      // We can't filter this by dateRange directly in Prisma,
      // but we can order by the total count of related articles.
      // For date-range-specific top assets, a more complex raw query would be needed.
      include: {
        _count: {
          select: { newsArticles: true },
        },
      },
      orderBy: {
        newsArticles: {
          _count: 'desc',
        },
      },
      take: 10,
    });
  }

  return {
    sentiments,
    topAssets,
    filterContext: options,
  };
};

/**
 * 4. Get News for Calendar View
 * Called by: `getNewsCalendarData` controller
 * Powers: `news/calendar/page.tsx`
 */
export const getNewsByDayForMonth = async (
  month: number,
  year: number,
) => {
  // `month` is 1-12 from controller, but 0-11 in JS Date constructor
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // 1st day of next month

  // Use a raw SQL query for efficient grouping by day.
  // This is much faster than fetching all articles and processing in JS.
  const calendarData = await prisma.$queryRaw`
    SELECT
      DATE("publishedAt") as date,
      COUNT(*)::int as count
    FROM "NewsArticle"
    WHERE "publishedAt" >= ${startDate}
      AND "publishedAt" < ${endDate}
    GROUP BY DATE("publishedAt")
    ORDER BY date;
  `;

  return calendarData;
};

/**
 * 5. Fetch and Save News from External APIs
 * Called by: `triggerNewsFetch` controller
 * Powers: An admin button or cron job
 */
export const fetchAndSaveNews = async () => {
  // Use environment variables for API keys
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  // const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not set in environment variables');
  }

  // --- Example: Fetching from NewsAPI.org ---
  // You would replace this with your actual Finnhub or other API calls
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${NEWS_API_KEY}`;
  const response = await axios.get(url);
  const apiArticles = response.data.articles || [];

  let articlesCreated = 0;
  let articlesUpdated = 0;

  for (const article of apiArticles) {
    if (!article.url || !article.title || !article.publishedAt) {
      continue; // Skip articles with missing essential data
    }

    // --- Placeholder for Sentiment Analysis ---
    // In a real app, you'd call your RAG/LLM here to get sentiment
    // const sentiment = await analyzeSentiment(article.title + ' ' + article.description);
    const sentiment: NewsSentiment = 'NEUTRAL'; // Default

    // --- Placeholder for Asset/Symbol Extraction ---
    // In a real app, your RAG/LLM would extract relevant symbols
    // const symbols = await extractSymbols(article.content);
    const symbols = ['AAPL', 'MSFT']; // Example symbols

    // Check if an article with this URL already exists so we can decide create vs update
    const existing = await prisma.newsArticle.findUnique({
      where: { url: article.url },
      select: { id: true },
    });

    if (existing) {
      // Update existing article (e.g., sentiment or other fields)
      await prisma.newsArticle.update({
        where: { url: article.url },
        data: {
          sentiment: sentiment,
        },
      });
      articlesUpdated++;
    } else {
      // Create new article and related assets
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          description: article.description || '',
          url: article.url,
          imageUrl: article.urlToImage,
          sourceName: article.source.name,
          author: article.author,
          publishedAt: new Date(article.publishedAt),
          content: article.content,
          sentiment: sentiment,
          // --- This is the key relational part ---
          // Connect to existing assets or create them if they don't exist.
          // This ensures your Asset table stays populated.
          relatedAssets: {
            connectOrCreate: symbols.map((sym) => ({
              where: { symbol: sym },
              create: {
                id: sym, // Use symbol as ID
                symbol: sym,
                name: sym, // Placeholder name
                type: 'STOCK', // Default type, adjust as needed
              },
            })),
          },
        },
      });
      articlesCreated++;
    }
  }

  return {
    message: 'News fetch completed',
    totalFetched: apiArticles.length,
    articlesCreated,
    articlesUpdated,
  };
};