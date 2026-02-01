/**
 * PUBLIC SHAYARI API BRIDGE (Deno)
 * Fetches from Vercel source and allows public access for everyone.
 * Developed by Ramzan Ahsan
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// --- CONFIGURATION ---
const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";
const ALLOWED_ORIGIN = "*"; // Everyone can use this now

console.log("Ramzan Ahsan's Public API Bridge is running...");

serve(async (req: Request) => {
  // Global Public Headers
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle Options (Pre-flight for browsers)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // 1. ROUTING & CATEGORY
  const url = new URL(req.url);
  const category = url.searchParams.get("cat") || "romantic";
  const validCategories = ["romantic", "sad", "funny", "friend", "shayari"];
  const target = validCategories.includes(category) ? category : "romantic";

  try {
    // 2. FETCH FROM THE SOURCE (Original logic you provided)
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`);
    const data = await response.json();

    // 3. RETURN RESPONSE TO ANYONE
    return new Response(
      JSON.stringify({
        status: true,
        shayari: data.shayari,
        category: target,
        developed_by: "Ramzan Ahsan"
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: false, 
        message: "Source API Error",
        developer: "Ramzan Ahsan"
      }),
      { status: 500, headers }
    );
  }
});
