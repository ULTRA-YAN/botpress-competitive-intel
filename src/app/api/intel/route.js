import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Source reliability tiers — higher = more trustworthy
const SOURCE_TIERS = {
  // Tier 4: Company press releases & official wires
  prnewswire: 4, businesswire: 4, globenewswire: 4, accesswire: 4,
  // Tier 3: Top-tier tech press
  techcrunch: 3, theverge: 3, reuters: 3, bloomberg: 3, wired: 3,
  wsj: 3, nytimes: 3, ft: 3, cnbc: 3, fortune: 3, forbes: 3,
  venturebeat: 3, zdnet: 3, arstechnica: 3, siliconangle: 3,
  // Tier 2: Solid industry press
  cmswire: 2, cxtoday: 2, pcmag: 2, techradar: 2, g2: 2,
  martechcube: 2, destinationcrm: 2, nojitter: 2, citybiz: 2,
  martech: 2, enterprisetimes: 2, analyticsinsight: 2, cybernews: 2,
  tipranks: 2, motleyfool: 2, ventureburn: 2, insiderph: 2,
  // Tier 1: Everything else
};

function getSourceTier(headline) {
  // Extract source name from after last " - " in headline
  const match = headline?.match(/\s*[-–|]\s*([^-–|]+)$/);
  if (!match) return 1;
  const source = match[1].toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, tier] of Object.entries(SOURCE_TIERS)) {
    if (source.includes(key)) return tier;
  }
  return 1;
}

// Strip source suffix and common noise from headline for comparison
function normalizeHeadline(headline) {
  if (!headline) return "";
  return headline
    .toLowerCase()
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/\s*[-–|]\s*[^-–|]+$/, "") // strip source attribution
    .replace(/[''""]/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract significant keywords (skip stopwords)
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "and", "but", "or",
  "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
  "every", "all", "any", "few", "more", "most", "other", "some", "such",
  "than", "too", "very", "just", "about", "up", "out", "its", "it",
  "that", "this", "these", "those", "what", "which", "who", "whom",
  "how", "why", "when", "where", "new", "best", "top", "my", "your",
]);

function extractKeywords(headline) {
  const normalized = normalizeHeadline(headline);
  return normalized.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// Calculate Jaccard similarity between two keyword sets
function similarity(wordsA, wordsB) {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

// Smart deduplicate: cluster similar headlines, keep highest-tier source
function smartDedupe(items) {
  if (!items || items.length === 0) return [];

  // First: exact-headline dedup (same headline minus source)
  const normalizedMap = new Map();
  for (const item of items) {
    const key = normalizeHeadline(item.headline);
    const tier = getSourceTier(item.headline);
    if (!normalizedMap.has(key) || tier > getSourceTier(normalizedMap.get(key).headline)) {
      normalizedMap.set(key, item);
    }
  }
  const exactDeduped = Array.from(normalizedMap.values());

  // Second: fuzzy topic clustering
  const clusters = []; // array of { representative, keywords, tier }
  for (const item of exactDeduped) {
    const keywords = extractKeywords(item.headline);
    const tier = getSourceTier(item.headline);
    let merged = false;

    for (const cluster of clusters) {
      const sim = similarity(keywords, cluster.keywords);
      if (sim >= 0.45) {
        // Same topic — keep higher-tier source, or more recent if same tier
        if (tier > cluster.tier || (tier === cluster.tier && new Date(item.published_at) > new Date(cluster.representative.published_at))) {
          cluster.representative = item;
          cluster.tier = tier;
        }
        // Merge keywords for better future matching
        cluster.keywords = [...new Set([...cluster.keywords, ...keywords])];
        merged = true;
        break;
      }
    }

    if (!merged) {
      clusters.push({ representative: item, keywords, tier });
    }
  }

  return clusters.map((c) => c.representative);
}

// GET: Fetch intel updates for the dashboard
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const company = searchParams.get("company");
  const limit = parseInt(searchParams.get("limit") || "200");

  try {
    // Only show news from the last 6 months
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch a larger set to dedupe from
    let query = supabase
      .from("intel_updates")
      .select("*")
      .gte("published_at", sixMonthsAgo)
      .order("published_at", { ascending: false })
      .limit(500);

    if (category) query = query.eq("category", category);
    if (company) query = query.ilike("company", `%${company}%`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Smart deduplicate with source priority
    const unique = smartDedupe(data || []);

    // Get category counts from deduplicated full set
    const { data: allData } = await supabase
      .from("intel_updates")
      .select("id, headline, category, published_at")
      .gte("published_at", sixMonthsAgo)
      .limit(1000);

    const uniqueAll = smartDedupe(allData || []);
    const categoryCounts = uniqueAll.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      updates: unique.slice(0, limit),
      total: unique.length,
      categoryCounts,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
