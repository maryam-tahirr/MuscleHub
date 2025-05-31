import type { NextApiRequest, NextApiResponse } from "next";

export async function fetchMeals(query: string) {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.meals) throw new Error("No recipes found");
  return data.meals;
}
