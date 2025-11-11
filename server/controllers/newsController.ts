import { Request, Response } from "express";
import * as newsService from "../services/newsServices";

export const getAllNews = async (req: Request, res: Response) => {
  try {
    const data = await newsService.fetchAllNews();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching news" });
  }
};

export const getNewsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const data = await newsService.fetchNewsByCategory(category);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching category news" });
  }
};
