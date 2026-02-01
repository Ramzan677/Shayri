import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// --- CONFIGURATION ---
const ALLOWED_ORIGIN = "your-website-domain.com"; // CHANGE THIS to your actual website name
const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";

console.log(`Secure Shayari API running. Allowed Origin: ${ALLOWED_ORIGIN}`);

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  
  // 1. SECURITY: Website Name Validation
  // This checks if the request is coming from your specific website
  if (!origin.includes(ALLOWED_ORIGIN)) {
    return new Response(
      JSON.stringify({ status: false, message: "Access Denied: Unauthorized Website" }),
      { 
        status: 403, 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      }
    );
  }

  // 2. ROUTING
  const url = new URL(req.url);
  const category = url.searchParams.get("cat") || "romantic";
  const validCategories = ["romantic", "sad", "funny", "friend"];
  const target = validCategories.includes(category) ? category : "romantic";

  try {
    // 3. FETCH FROM SOURCE
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`);
    const data = await response.json();

    // 4. RETURN SECURE RESPONSE
    return new Response(
      JSON.stringify({
        status: true,
        shayari: data.shayari,
        category: target,
        developed_by: "Ramzan Ahsan"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": `https://${ALLOWED_ORIGIN}`, // Hardcoded lock
          "Access-Control-Allow-Methods": "GET",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: false, message: "Upstream API Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
