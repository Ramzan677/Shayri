/**
 * PUBLIC SHAYARI API BRIDGE (Deno)
 * Focus: Roman English + Emoji Support + Zero Failure Logic
 * Developed by Ramzan Ahsan
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const EXTERNAL_API_BASE = "https://fast-dev-apis.vercel.app";
const ALLOWED_ORIGIN = "*"; 

// A collection of emojis to make the shayari look professional and beautiful
const EMOJI_SET = ["❤️", "✨", "🥀", "🌙", "🩹", "💭", "🕊️", "💎", "⏳", "🔥", "🌸", "🦋", "🦁", "👑", "🍃"];

// High-quality Roman English Fallbacks (Used if the external API is unreachable)
const BACKUP_DB: Record<string, string[]> = {
  romantic: [
    "Aap se door ho kar hum jayenge kaha,\nAap jaisa dost hum payenge kaha.",
    "Tujhe dekha toh yeh jaana sanam,\nPyaar hota hai deewana sanam.",
    "Dil ki dhadkan aur meri sadaa ho tum,\nmeri pehli aur aakhri wafa ho tum."
  ],
  sad: [
    "Dil todna toh sabki aadat ban gayi hai,\nAb toh tanhayi hi apni ibaadat ban gayi hai.",
    "Mohabbat mein rona toh naseeb ki baat hai,\nPar kisi ke liye rona dil ki gehraayi hai."
  ],
  funny: [
    "Macchar ne jo kata, dil mein mere junoon tha,\nKhujli itni hui, ki dil ka sukoon tha.",
    "Ishq mein hum tumhe kya batayein,\nkhud ko bhool gaye tumhe yaad karte karte."
  ],
  friend: [
    "Dosti woh nahi jo jaan deti hai,\nDosti woh hai jo muskaan deti hai.",
    "Dost vahi jo bheed mein bhi,\naapka haath thame rakhe."
  ]
};

console.log("Ramzan Ahsan's Secure Public API is Live! (Roman + Emoji)");

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
    // Fetch with a real browser User-Agent to prevent blocks
    const response = await fetch(`${EXTERNAL_API_BASE}/${target}`, {
      method: "GET",
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) throw new Error("Upstream Timeout");

    const data = await response.json();
    let text = data.shayari;

    // Check if the text is Roman (contains English letters)
    const isRoman = /[a-zA-Z]/.test(text);
    
    // If not Roman, try to get a Romantic one which is usually Roman
    if (!isRoman) {
       const retry = await fetch(`${EXTERNAL_API_BASE}/romantic`);
       const retryData = await retry.json();
       text = retryData.shayari;
    }

    return sendResponse(text, target, headers);

  } catch (error) {
    // If anything fails, send a beautiful high-quality fallback
    const list = BACKUP_DB[target === "shayari" ? "romantic" : target] || BACKUP_DB.romantic;
    const fallbackText = list[Math.floor(Math.random() * list.length)];
    
    return sendResponse(fallbackText, target, headers, true);
  }
});

/**
 * Helper to format and send the JSON response
 */
function sendResponse(text: string, category: string, headers: Headers, isFallback = false) {
  // Add 2 random emojis
  const e1 = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
  const e2 = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
  
  const finalShayari = `${text.trim()} ${e1}${e2}`;

  return new Response(
    JSON.stringify({
      status: true,
      shayari: finalShayari,
      category: category,
      language: "Roman English",
      developer: "Ramzan Ahsan",
      mode: isFallback ? "Secure Mode" : "Live API"
    }),
    { status: 200, headers }
  );
}
