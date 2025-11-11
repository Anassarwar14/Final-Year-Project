import { pool } from "../config/db";

export const fetchAllNews = async () => {
  const result = await pool.query("SELECT * FROM news ORDER BY created_at DESC");
  return result.rows;
};

export const fetchNewsByCategory = async (category: string) => {
  const result = await pool.query("SELECT * FROM news WHERE category = $1", [category]);
  return result.rows;
};
