import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Deduplicate by headline — keep the earliest entry for each unique headline
function dedupeByHeadline(items) {
  const seen = new Map();
  for (const item of items) {
    // Normalize: lowercase, trim, strip trailing source attribution like " - TechCrunch"
    const key = item.headline?.toLowerCase().trim().replace(/\s*[-–|]\s*[^-–|]+$/, "") || "";
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
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

    // Fetch a larger set to dedupe from (duplicates reduce the count)
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

    // Deduplicate by headline
    const unique = dedupeByHeadline(data || []);

    // Get category counts from deduplicated set (last 6 months only)
    const { data: allData } = await supabase
      .from("intel_updates")
      .select("id, headline, category")
      .gte("published_at", sixMonthsAgo)
      .limit(1000);

    const uniqueAll = dedupeByHeadline(allData || []);
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
