import express from "express";
import { getAllNews, getNewsByCategory } from "../controllers/newsController";

const router = express.Router();

router.get("/", getAllNews);
router.get("/:category", getNewsByCategory);

export default router;