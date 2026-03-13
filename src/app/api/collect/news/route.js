import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// All 35 competitors to track
const COMPANIES = [
  "Zendesk", "Salesforce Service Cloud", "Intercom", "Freshdesk", "HubSpot Service Hub",
  "Genesys", "NICE CXone", "Drift", "Ada", "Kustomer",
  "Tidio", "LivePerson", "Gorgias", "Dixa", "Gladly",
  "Yellow.ai", "Cognigy", "Haptik", "Moveworks", "Forethought",
  "Ultimate.ai", "Thankful", "Netomi", "Aisera", "Boost.ai",
  "Certainly", "Heyday", "Zowie", "Lang.ai", "Talkdesk",
  "Five9", "8x8", "RingCentral", "Vonage", "Twilio Flex",
];

// Category keywords for auto-classification
const CATEGORY_KEYWORDS = {
  funding: ["funding", "raises", "series", "investment", "valuation", "ipo", "acquisition", "acquired", "merger", "deal"],
  feature: ["launches", "announces", "new feature", "integration", "release", "update", "ai-powered", "generative ai", "llm", "gpt", "copilot", "agent"],
  leadership: ["ceo", "cto", "cfo", "coo", "appoints", "hires", "joins as", "promoted", "steps down", "resigns", "new head of", "chief"],
  pivot: ["pivot", "restructur", "layoff", "rebrand", "new direction", "shifts focus", "discontinue", "sunset", "wind down"],
};

function classifyHeadline(headline) {
  const lower = headline.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "feature"; // default
}

// Fetch Google News RSS for a company (free, no API key)
async function fetchGoogleNews(company) {
  const query = encodeURIComponent(`"${company}" AI customer service`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const xml = await res.text();

    // Simple XML parse for RSS items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") || "";
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

      items.push({
        company,
        category: classifyHeadline(title),
        headline: title.substring(0, 500),
        source_url: link,
        source: "google_news",
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }

    // Filter out articles older than 6 months
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const recent = items.filter((item) => new Date(item.published_at) >= sixMonthsAgo);

    return recent.slice(0, 3); // top 3 per company
  } catch (e) {
    console.error(`Error fetching news for ${company}:`, e.message);
    return [];
  }
}

export async function GET(request) {
  // Optional: verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let allItems = [];

    // Fetch news for all companies (batch in groups of 5 to avoid rate limits)
    for (let i = 0; i < COMPANIES.length; i += 5) {
      const batch = COMPANIES.slice(i, i + 5);
      const results = await Promise.all(batch.map(fetchGoogleNews));
      allItems.push(...results.flat());

      // Small delay between batches
      if (i + 5 < COMPANIES.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({ message: "No new items found", inserted: 0 });
    }

    // Dedupe within the batch itself (same headline from different company searches)
    const batchSeen = new Map();
    for (const item of allItems) {
      const key = item.headline?.toLowerCase().trim().replace(/\s*[-–|]\s*[^-–|]+$/, "") || "";
      if (!batchSeen.has(key)) {
        batchSeen.set(key, item);
      }
    }
    allItems = Array.from(batchSeen.values());

    // Check for duplicates against existing DB entries
    const { data: existing } = await supabase
      .from("intel_updates")
      .select("headline")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const existingKeys = new Set((existing || []).map((e) => e.headline?.toLowerCase().trim().replace(/\s*[-–|]\s*[^-–|]+$/, "") || ""));
    const newItems = allItems.filter((item) => {
      const key = item.headline?.toLowerCase().trim().replace(/\s*[-–|]\s*[^-–|]+$/, "") || "";
      return !existingKeys.has(key);
    });

    if (newItems.length === 0) {
      return NextResponse.json({ message: "All items already exist", inserted: 0 });
    }

    // Insert new items
    const { data, error } = await supabase.from("intel_updates").insert(newItems);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Collected ${newItems.length} new intel updates`,
      inserted: newItems.length,
      companies_scanned: COMPANIES.length,
    });
  } catch (err) {
    console.error("Collection error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
