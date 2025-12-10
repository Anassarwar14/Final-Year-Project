// import express from "express";
// import { getAllNews, getNewsByCategory } from "../controllers/newsController";

// const router = express.Router();

// router.get("/", getAllNews);
// router.get("/:category", getNewsByCategory);

// export default router;

import { NextResponse } from "next/server";
// Import the service you created earlier
import { marketDataService } from "../services/marketDataService"; 

export async function GET() {
  try {
    // This is equivalent to newsService.fetchAllNews()
    // Defaulting to "general" market news for the main feed
    const data = await marketDataService.getMarketNews("general");
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in generic news route:", err);
    return NextResponse.json(
      { error: "Error fetching news" },
      { status: 500 }
    );
  }
}


