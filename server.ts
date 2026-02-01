/**
 * PUBLIC SHAYARI API BRIDGE (Deno)
 * Pure Bridge Mode: Fetches ONLY from external API
 * Developed by Ramzan Ahsan
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";
const ALLOWED_ORIGIN = "*"; 

// Emojis are still added to the API result to make it look professional
const EMOJI_SET = ["❤️", "✨", "🥀", "🌙", "🩹", "💭", "🕊️", "💎", "⏳", "🔥", "🌸", "🦋", "🍃"];

console.log("Ramzan Ahsan's Pure API Bridge is Live!");

serve(async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, User-Agent",
  });

  if (req.method === "OPTIONS") return new Response(null, { headers });

  const url = new URL(req.url);
  const category = url.searchParams.get("cat")?.toLowerCase() || "romantic";
  const validCategories = ["romantic", "sad", "funny", "friend", "shayari"];
  const target = validCategories.includes(category) ? category : "romantic";

  try {
    // 1. FETCH ONLY FROM EXTERNAL API
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`, {
      method: "GET",
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) throw new Error("Upstream API is unreachable");

    const data = await response.json();
    let text = data.shayari;

    // 2. ROMAN ENGLISH VALIDATION
    // If the selected category gives non-Roman text, we force a fetch from 'romantic'
    const isRoman = /[a-zA-Z]/.test(text);
    if (!isRoman) {
       const retry = await fetch(`${EXTERNAL_API_BASE}/romantic`);
       const retryData = await retry.json();
       text = retryData.shayari;
    }

    // 3. ADD EMOJIS & SEND
    const e1 = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
    const e2 = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
    const finalShayari = `${text.trim()} ${e1}${e2}`;

    return new Response(
      JSON.stringify({
        status: true,
        shayari: finalShayari,
        category: target,
        developer: "Ramzan Ahsan"
      }),
      { status: 200, headers }
    );

  } catch (error) {
    // No internal poetry used here anymore
    return new Response(
      JSON.stringify({ 
        status: false, 
        message: "External API Error. No data received from source.",
        developer: "Ramzan Ahsan"
      }),
      { status: 502, headers }
    );
  }
});
