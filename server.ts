/**
 * PUBLIC SHAYARI API BRIDGE (Deno)
 * Focus: Roman English + Emoji Support
 * Developed by Ramzan Ahsan
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";
const ALLOWED_ORIGIN = "*"; 

// A collection of emojis to make the shayari look better
const EMOJI_SET = ["❤️", "✨", "🥀", "🌙", "🩹", "💭", "🕊️", "💎", "⏳", "🔥"];

console.log("Ramzan Ahsan's Roman Shayari API with Emoji support is running...");

serve(async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (req.method === "OPTIONS") return new Response(null, { headers });

  const url = new URL(req.url);
  const category = url.searchParams.get("cat")?.toLowerCase() || "romantic";
  
  // We prioritize 'romantic' as it is the most reliable source for Roman English
  const validCategories = ["romantic", "sad", "funny", "friend", "shayari"];
  const target = validCategories.includes(category) ? category : "romantic";

  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Source Down");

    const data = await response.json();
    let text = data.shayari;

    // 1. EMOJI INJECTION
    // We add 1-2 random emojis at the end to make it look like "Real Shayari"
    const randomEmoji = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
    const secondEmoji = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
    
    // Check if text is Roman (basic check for English letters)
    const isRoman = /[a-zA-Z]/.test(text);
    
    // If the source returns Hindi script, we try to fetch from 'romantic' instead 
    // because you specifically want Roman English.
    if (!isRoman && target !== "romantic") {
       const retry = await fetch(`${EXTERNAL_API_BASE}/romantic`);
       const retryData = await retry.json();
       text = retryData.shayari;
    }

    // Append emojis for a better look
    const finalShayari = `${text} ${randomEmoji}${secondEmoji}`;

    return new Response(
      JSON.stringify({
        status: true,
        shayari: finalShayari,
        category: target,
        type: "Roman English",
        developed_by: "Ramzan Ahsan",
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: false, 
        message: "API currently refreshing...",
        developer: "Ramzan Ahsan"
      }),
      { status: 500, headers }
    );
  }
});
