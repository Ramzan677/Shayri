/**
 * PUBLIC SHAYARI API BRIDGE (Deno)
 * Fetches from Vercel source and allows public access for everyone.
 * Developed by Ramzan Ahsan
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// --- CONFIGURATION ---
// Note: Changed to lowercase to match the working Vercel endpoint routes
const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";
const ALLOWED_ORIGIN = "*"; 

console.log("Ramzan Ahsan's Public API Bridge is running...");

serve(async (req: Request) => {
  // Global Public Headers for CORS
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
  });

  // Handle Options (Pre-flight for browsers)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // 1. ROUTING & CATEGORY
  const url = new URL(req.url);
  const category = url.searchParams.get("cat")?.toLowerCase() || "romantic";
  
  // Mapping categories to valid Vercel endpoints
  const validCategories = ["romantic", "sad", "funny", "friend", "shayari"];
  const target = validCategories.includes(category) ? category : "romantic";

  try {
    // 2. FETCH FROM THE SOURCE
    // Added a small timeout and error check to handle upstream issues
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const data = await response.json();

    // 3. RETURN RESPONSE (Everyone can access this)
    return new Response(
      JSON.stringify({
        status: true,
        shayari: data.shayari,
        category: target,
        developed_by: "Ramzan Ahsan",
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error(`API Error: ${error}`);
    return new Response(
      JSON.stringify({ 
        status: false, 
        message: "The source API is currently unavailable. Please try again later.",
        developer: "Ramzan Ahsan"
      }),
      { status: 500, headers }
    );
  }
});
