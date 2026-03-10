"use client";

import { useState, useMemo, useRef, createContext, useContext } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
  CartesianGrid, LabelList, ReferenceArea,
} from "recharts";

// ── THEMES ──
const DARK = {
  bg: "#0a0f1a", surface: "#111827", surfaceHover: "#1a2236",
  border: "#1e293b", text: "#e2e8f0", textMuted: "#94a3b8",
  accent: "#3b82f6", accentLight: "#60a5fa", danger: "#ef4444",
  warning: "#f59e0b", success: "#10b981", purple: "#8b5cf6",
  pink: "#ec4899", cyan: "#06b6d4", orange: "#f97316", lime: "#84cc16",
};

const LIGHT = {
  bg: "#f8fafc", surface: "#ffffff", surfaceHover: "#f1f5f9",
  border: "#d1d5db", text: "#1e293b", textMuted: "#64748b",
  accent: "#3b82f6", accentLight: "#2563eb", danger: "#ef4444",
  warning: "#f59e0b", success: "#10b981", purple: "#8b5cf6",
  pink: "#ec4899", cyan: "#06b6d4", orange: "#f97316", lime: "#84cc16",
};

const ThemeContext = createContext(DARK);
function useTheme() { return useContext(ThemeContext); }

const CAT_COLORS = {
  "Large Incumbent": "#3b82f6",
  "AI-First": "#8b5cf6",
  "Specialist": "#f59e0b",
  "Up-and-Coming": "#10b981",
  "CCaaS / Contact Center": "#ec4899",
  "Managed Service": "#06b6d4",
};

const ALL_CATEGORIES = Object.keys(CAT_COLORS);

const AI_COLORS = {
  "AI-First": "#8b5cf6",
  "AI-Forward": "#a78bfa",
  "Leaning into AI": "#f59e0b",
  "Hybrid": "#06b6d4",
};

const THREAT_COLORS = {
  "Immediate Threat": "#ef4444",
  "Flanking Threat": "#f97316",
  "Watch List": "#f59e0b",
  "Background": "#64748b",
};

// ── DATA (updated March 2026) ──
const competitors = [
  { name: "Zendesk", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 1950, revenueLabel: "$1.9B+ (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat + Resolution + Add-ons", resolutionPrice: 1.5, seatPrice: 115, fundingOrVal: "$10.2B (PE buyout)", founded: 2007, automationRate: "Up to 80% (unverified)", customers: 100000, aiScore: 7, marketBreadth: 10, automationDepth: 7, threatTier: "Immediate Threat", threatWhy: "Market-defining incumbent, $200M AI ARR, shows up in every deal" },
  { name: "Intercom", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 400, revenueLabel: "$400M+ ARR (Mar 2026)", aiPosture: "AI-Forward", pricingModel: "Seat + Resolution", resolutionPrice: 0.99, seatPrice: 85, fundingOrVal: "$492M raised", founded: 2011, automationRate: "67% avg (40M+ convos)", customers: 25000, aiScore: 9, marketBreadth: 8, automationDepth: 8, threatTier: "Immediate Threat", threatWhy: "Most successful AI pivot, Fin at ~$100M ARR, $0.99/resolution, Fin-over-API is a direct Botpress competitor" },
  { name: "Salesforce Service Cloud", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 8500, revenueLabel: "$8.5B (Service Cloud est.)", aiPosture: "Leaning into AI", pricingModel: "Seat + Flex Credits", resolutionPrice: null, seatPrice: 165, fundingOrVal: "Public (NYSE: CRM)", founded: 1999, automationRate: "N/A", customers: 150000, aiScore: 6, marketBreadth: 10, automationDepth: 5, threatTier: "Background", threatWhy: "CRM lock-in deals, not AI-first competition" },
  { name: "ServiceNow", category: "Large Incumbent", hq: "Santa Clara, USA", revenue: 13300, revenueLabel: "$13.3B total rev", aiPosture: "Leaning into AI", pricingModel: "Enterprise license + Assists", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NYSE: NOW)", founded: 2004, automationRate: "N/A", customers: 8100, aiScore: 7, marketBreadth: 9, automationDepth: 6, threatTier: "Background", threatWhy: "ITSM giant, CSM is secondary product" },
  { name: "Microsoft D365", category: "Large Incumbent", hq: "Redmond, USA", revenue: 6000, revenueLabel: "$6B+ (D365 est.)", aiPosture: "Leaning into AI", pricingModel: "Seat + Copilot Credits", resolutionPrice: null, seatPrice: 105, fundingOrVal: "Public (NASDAQ: MSFT)", founded: 1975, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 9, automationDepth: 5, threatTier: "Background", threatWhy: "Microsoft stack loyalty deals, not standalone CS competition" },
  { name: "HubSpot Service Hub", category: "Large Incumbent", hq: "Cambridge, USA", revenue: 2630, revenueLabel: "$2.63B total HubSpot", aiPosture: "Leaning into AI", pricingModel: "Seat + Credits", resolutionPrice: null, seatPrice: 90, fundingOrVal: "Public (NYSE: HUBS)", founded: 2006, automationRate: "50%+ claimed", customers: 248000, aiScore: 5, marketBreadth: 8, automationDepth: 4, threatTier: "Background", threatWhy: "CRM-first, Service Hub is secondary, SMB marketing buyers" },
  { name: "Zoho Desk", category: "Large Incumbent", hq: "Chennai, India", revenue: 1400, revenueLabel: "$1.4B (Zoho Corp)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 40, fundingOrVal: "Bootstrapped", founded: 1996, automationRate: "N/A", customers: null, aiScore: 3, marketBreadth: 7, automationDepth: 3, threatTier: "Background", threatWhy: "Budget play, ecosystem stickiness, basic AI" },
  { name: "Sierra", category: "AI-First", hq: "San Francisco, USA", revenue: 150, revenueLabel: "$150M+ ARR (early 2026)", aiPosture: "AI-First", pricingModel: "Outcome-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$635M / $10B val", founded: 2023, automationRate: "Outcome-based (unpublished)", customers: null, aiScore: 10, marketBreadth: 9, automationDepth: 10, threatTier: "Immediate Threat", threatWhy: "$10B val, $150M+ ARR in <2yrs, Fortune 1000 focus, voice overtook text" },
  { name: "Decagon", category: "AI-First", hq: "San Francisco, USA", revenue: 45, revenueLabel: "~$35-50M (est.)", aiPosture: "AI-First", pricingModel: "Per-conversation / resolution", resolutionPrice: null, seatPrice: null, fundingOrVal: "$481M / $4.5B val", founded: 2023, automationRate: "80%+ claimed", customers: null, aiScore: 10, marketBreadth: 7, automationDepth: 9, threatTier: "Immediate Threat", threatWhy: "AI-native, $4.5B val (tripled in 6mo), 100+ enterprise logos in 2025" },
  { name: "Ada", category: "AI-First", hq: "Toronto, Canada", revenue: 71, revenueLabel: "$70.6M rev", aiPosture: "AI-First", pricingModel: "Per-resolution", resolutionPrice: 2.25, seatPrice: null, fundingOrVal: "$200M / $1.2B val (2021)", founded: 2016, automationRate: "70-84% (claimed)", customers: 5000, aiScore: 9, marketBreadth: 8, automationDepth: 9, threatTier: "Immediate Threat", threatWhy: "Closest pure-play AI comp to Botpress, Toronto HQ, $70M rev, stale valuation" },
  { name: "Forethought", category: "AI-First", hq: "San Francisco, USA", revenue: 30, revenueLabel: "~$30M (est.)", aiPosture: "AI-First", pricingModel: "Usage-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$115M+ raised", founded: 2018, automationRate: "70%+ (G2 reviewer)", customers: null, aiScore: 8, marketBreadth: 7, automationDepth: 8, threatTier: "Immediate Threat", threatWhy: "Sits on top of helpdesks like Botpress, multi-agent architecture" },
  { name: "Cognigy (NICE)", category: "AI-First", hq: "Dusseldorf, Germany", revenue: 65, revenueLabel: "~$65M (2025 est.)", aiPosture: "AI-First", pricingModel: "Enterprise subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "Acquired $955M (Jul 2025)", founded: 2016, automationRate: "N/A", customers: 1000, aiScore: 9, marketBreadth: 9, automationDepth: 8, threatTier: "Immediate Threat", threatWhy: "Gartner MQ Leader, now backed by NICE $955M acquisition" },
  { name: "Maven AGI", category: "AI-First", hq: "Boston, USA", revenue: 10, revenueLabel: "~$10M+ (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$78M raised", founded: 2023, automationRate: "93% (OpenAI-cited)", customers: 50, aiScore: 9, marketBreadth: 7, automationDepth: 9, threatTier: "Watch List", threatWhy: "$0 to $7M Y1, claims 93% resolution rate, model-agnostic" },
  { name: "Crescendo AI", category: "Managed Service", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M+ ARR (est. 2025)", aiPosture: "AI-First", pricingModel: "Outcome-based managed service", resolutionPrice: null, seatPrice: null, fundingOrVal: "$50M+ / $500M val", founded: 2024, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 4, automationDepth: 8, threatTier: "Flanking Threat", threatWhy: "Managed AI service replaces both software AND staffing" },
  { name: "Gorgias", category: "Specialist", hq: "San Francisco, USA", revenue: 73, revenueLabel: "$69-73M ARR", aiPosture: "Hybrid", pricingModel: "Ticket + Resolution", resolutionPrice: 0.90, seatPrice: null, fundingOrVal: "$114M raised", founded: 2015, automationRate: "60% (vendor claim)", customers: 15000, aiScore: 6, marketBreadth: 2, automationDepth: 7, threatTier: "Flanking Threat", threatWhy: "Owns Shopify e-commerce vertical, 15K merchants" },
  { name: "Gladly", category: "Specialist", hq: "San Francisco, USA", revenue: 48, revenueLabel: "$47.7M rev", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$208M raised", founded: 2014, automationRate: "N/A", customers: null, aiScore: 6, marketBreadth: 3, automationDepth: 6, threatTier: "Flanking Threat", threatWhy: "Retail/DTC niche, people-centered, acquired Thankful for AI" },
  { name: "DevRev", category: "Specialist", hq: "Palo Alto, USA", revenue: 15, revenueLabel: "~$15M (est.)", aiPosture: "AI-First", pricingModel: "Issue-based", resolutionPrice: null, seatPrice: 25, fundingOrVal: "$150M+ / $1.15B val", founded: 2020, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 3, automationDepth: 7, threatTier: "Watch List", threatWhy: "$1.15B val, AI-native DevCRM, Nutanix founder" },
  { name: "Helpshift", category: "Specialist", hq: "San Francisco, USA", revenue: 25, revenueLabel: "~$25M (est.)", aiPosture: "Hybrid", pricingModel: "Issue-based", resolutionPrice: 0.45, seatPrice: null, fundingOrVal: "Acquired $75M", founded: 2011, automationRate: "Up to 90% (vendor)", customers: null, aiScore: 5, marketBreadth: 2, automationDepth: 6, threatTier: "Background", threatWhy: "Gaming-only niche under Keywords Studios" },
  { name: "Polimorphic", category: "Specialist", hq: "New York, USA", revenue: 5, revenueLabel: "~$5M (est.)", aiPosture: "AI-First", pricingModel: "Population-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$28M raised", founded: 2022, automationRate: "50-90% call reduction", customers: null, aiScore: 7, marketBreadth: 1, automationDepth: 7, threatTier: "Background", threatWhy: "Government-only, zero competitive overlap" },
  { name: "Kustomer", category: "Up-and-Coming", hq: "New York, USA", revenue: 35, revenueLabel: "~$35M (est.)", aiPosture: "AI-First", pricingModel: "Conversation-based", resolutionPrice: 0.50, seatPrice: 89, fundingOrVal: "$90M post-Meta", founded: 2015, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 5, automationDepth: 7, threatTier: "Immediate Threat", threatWhy: "Conversation-based pricing pivot, AI-native relaunch, disruptive model" },
  { name: "Sprinklr", category: "Up-and-Coming", hq: "New York, USA", revenue: 796, revenueLabel: "$796M (9% YoY, decelerating)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 249, fundingOrVal: "Public (CXM) ~$1.5B cap", founded: 2009, automationRate: "90%+ accuracy (vendor)", customers: null, aiScore: 6, marketBreadth: 7, automationDepth: 5, threatTier: "Background", threatWhy: "Declining ($7B to $1.5B cap), class action, leadership churn" },
  { name: "Front", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M ARR (Sep 2025)", aiPosture: "Leaning into AI", pricingModel: "Seat + Resolution", resolutionPrice: 0.70, seatPrice: 65, fundingOrVal: "$204M / $1.7B val", founded: 2013, automationRate: "N/A", customers: 9000, aiScore: 5, marketBreadth: 5, automationDepth: 5, threatTier: "Flanking Threat", threatWhy: "$100M ARR, collaborative inbox DNA, adding AI fast" },
  { name: "Dixa", category: "Up-and-Coming", hq: "Copenhagen, Denmark", revenue: 23, revenueLabel: "$23.4M (2024 est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 109, fundingOrVal: "$164M raised (last Jul 2021)", founded: 2015, automationRate: "Up to 80% (vendor)", customers: null, aiScore: 5, marketBreadth: 4, automationDepth: 5, threatTier: "Watch List", threatWhy: "Acquired Solvemate, Mim AI agent launched 2025, e-commerce pivot" },
  { name: "Help Scout", category: "Up-and-Coming", hq: "Boston, USA", revenue: 36, revenueLabel: "$36M rev", aiPosture: "Leaning into AI", pricingModel: "Contacts-based (unlimited seats)", resolutionPrice: 0.75, seatPrice: null, fundingOrVal: "$14M raised (near-bootstrapped)", founded: 2011, automationRate: "N/A", customers: 12000, aiScore: 5, marketBreadth: 4, automationDepth: 4, threatTier: "Watch List", threatWhy: "Radical pricing pivot (contacts-based, unlimited seats), anti-Zendesk" },
  { name: "Tidio", category: "Up-and-Coming", hq: "Szczecin, Poland", revenue: 20, revenueLabel: "~$20M (est.)", aiPosture: "Hybrid", pricingModel: "Freemium + conversation", resolutionPrice: 0.50, seatPrice: 29, fundingOrVal: "$26.8M raised", founded: 2013, automationRate: "67% (Lyro)", customers: 300000, aiScore: 5, marketBreadth: 7, automationDepth: 5, threatTier: "Watch List", threatWhy: "300K businesses, Lyro AI at $0.50/resolution, freemium growth" },
  { name: "Pylon", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 15, revenueLabel: "~$10-20M (5x YoY)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$51M raised (Series B Aug 2025)", founded: 2022, automationRate: "N/A (augmentation focus)", customers: 780, aiScore: 6, marketBreadth: 3, automationDepth: 5, threatTier: "Flanking Threat", threatWhy: "Stealing 150+ customers from Zendesk/Intercom, 5x YoY, B2B Slack-native" },
  { name: "Parloa", category: "AI-First", hq: "Berlin, Germany", revenue: 50, revenueLabel: "$50M+ ARR (Dec 2025)", aiPosture: "AI-First", pricingModel: "Enterprise custom ($300K+ min)", resolutionPrice: null, seatPrice: null, fundingOrVal: "$560M+ / $3B val", founded: 2018, automationRate: "N/A", customers: 1000, aiScore: 9, marketBreadth: 8, automationDepth: 9, threatTier: "Flanking Threat", threatWhy: "Voice-first AI, $560M raised, $3B val, strong in DACH/insurance" },
  { name: "Giga", category: "AI-First", hq: "San Francisco, USA", revenue: 10, revenueLabel: "Early-stage", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$65M Series A (Nov 2025)", founded: 2023, automationRate: "90%+ DWR in production", customers: null, aiScore: 9, marketBreadth: 2, automationDepth: 9, threatTier: "Flanking Threat", threatWhy: "Voice AI, won DoorDash over 20+ vendors, $65M Series A" },
  { name: "Capacity", category: "Up-and-Coming", hq: "St. Louis, USA", revenue: 60, revenueLabel: "$60M ARR (profitable)", aiPosture: "Hybrid", pricingModel: "Mid-market subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "$155M+ (11 acquisitions)", founded: 2017, automationRate: "90% (vendor claim)", customers: 19000, aiScore: 5, marketBreadth: 5, automationDepth: 5, threatTier: "Watch List", threatWhy: "$60M ARR, 19K customers, 11 acquisitions in 3 years" },
  { name: "Nurix AI", category: "AI-First", hq: "San Francisco, USA", revenue: 1, revenueLabel: "~$640K (Mar 2025)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$27.5M raised", founded: 2024, automationRate: "80%+ claimed", customers: null, aiScore: 8, marketBreadth: 2, automationDepth: 8, threatTier: "Watch List", threatWhy: "Voice-first, Myntra founder, $27.5M raised, India/BPO angle" },
  { name: "Synthflow AI", category: "AI-First", hq: "Berlin, Germany", revenue: 8, revenueLabel: "~$8M (est.)", aiPosture: "AI-First", pricingModel: "Usage-based ($0.12-0.13/min)", resolutionPrice: null, seatPrice: 29, fundingOrVal: "$30M raised", founded: 2023, automationRate: "N/A", customers: 1000, aiScore: 7, marketBreadth: 4, automationDepth: 7, threatTier: "Watch List", threatWhy: "No-code voice AI for SMBs, $30M raised, 45M calls handled" },
  { name: "Five9", category: "CCaaS / Contact Center", hq: "San Ramon, USA", revenue: 1150, revenueLabel: "$1.15B rev (FY2025)", aiPosture: "Leaning into AI", pricingModel: "Seat + per-minute AI", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NASDAQ: FIVN)", founded: 2001, automationRate: "N/A", customers: 3000, aiScore: 6, marketBreadth: 7, automationDepth: 5, threatTier: "Background", threatWhy: "CCaaS infrastructure, different buyer (contact center ops)" },
  { name: "Genesys", category: "CCaaS / Contact Center", hq: "San Francisco, USA", revenue: 2200, revenueLabel: "$2.2B Cloud ARR", aiPosture: "Leaning into AI", pricingModel: "Seat + AI consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "$1.5B from Salesforce + ServiceNow", founded: 1990, automationRate: "N/A", customers: 8000, aiScore: 7, marketBreadth: 9, automationDepth: 6, threatTier: "Background", threatWhy: "Largest CCaaS, enterprise contact center, different layer" },
  { name: "IBM watsonx", category: "CCaaS / Contact Center", hq: "Armonk, USA", revenue: null, revenueLabel: "Part of IBM ($60B+)", aiPosture: "Leaning into AI", pricingModel: "Subscription + consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NYSE: IBM)", founded: 1911, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 6, automationDepth: 6, threatTier: "Background", threatWhy: "Enterprise AI platform, not customer service focused" },
  { name: "Yellow.ai", category: "AI-First", hq: "Bangalore, India", revenue: 80, revenueLabel: "$79.5M rev (layoffs Dec 2025)", aiPosture: "Hybrid", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$102M+ (last round Aug 2021)", founded: 2016, automationRate: "N/A", customers: 1100, aiScore: 7, marketBreadth: 8, automationDepth: 7, threatTier: "Flanking Threat", threatWhy: "Strong in India/APAC/Middle East, 1,100 enterprises, but distress signals" },
];

// ── TABS ──
const TABS = [
  { id: "threats", label: "Threat Map" },
  { id: "matrix", label: "Positioning Matrix" },
  { id: "revenue", label: "Revenue & Funding" },
  { id: "pricing", label: "Pricing Models" },
  { id: "aiPosture", label: "AI Maturity" },
  { id: "dynamics", label: "Competitive Dynamics" },
  { id: "analysis", label: "Cross-Cutting Analysis" },
];

// ── TOOLTIP ──
function TT({ active, payload }) {
  const t = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 16px", maxWidth: 280, zIndex: 50 }}>
      <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{d.name}</div>
      <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{d.category} · {d.hq}</div>
      {d.revenueLabel && <div style={{ color: t.accent, fontSize: 12, marginTop: 6 }}>Revenue: {d.revenueLabel}</div>}
      {d.aiPosture && <div style={{ color: AI_COLORS[d.aiPosture] || t.textMuted, fontSize: 12 }}>AI: {d.aiPosture}</div>}
      {d.pricingModel && <div style={{ color: t.textMuted, fontSize: 12 }}>Pricing: {d.pricingModel}</div>}
    </div>
  );
}

// ── CATEGORY FILTER ──
function CategoryFilter({ selected, onToggle }) {
  const t = useTheme();
  const allSelected = selected.length === ALL_CATEGORIES.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
      <button onClick={() => onToggle("ALL")} style={{ background: allSelected ? t.accent : "transparent", color: allSelected ? "#fff" : t.textMuted, border: `1px solid ${allSelected ? t.accent : t.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>All ({competitors.length})</button>
      {ALL_CATEGORIES.map(cat => {
        const active = selected.includes(cat);
        const count = competitors.filter(c => c.category === cat).length;
        return (
          <button key={cat} onClick={() => onToggle(cat)} style={{ background: active ? CAT_COLORS[cat] + "22" : "transparent", color: active ? CAT_COLORS[cat] : t.textMuted, border: `1px solid ${active ? CAT_COLORS[cat] : t.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? CAT_COLORS[cat] : t.border }} />{cat} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ── JITTER ──
function applyJitter(data) {
  const groups = {};
  data.forEach((item, idx) => { const key = `${item.x},${item.y}`; if (!groups[key]) groups[key] = []; groups[key].push(idx); });
  const result = data.map(item => ({ ...item }));
  Object.values(groups).forEach(indices => {
    if (indices.length <= 1) return;
    indices.forEach((dataIdx, i) => { const angle = (2 * Math.PI * i) / indices.length - Math.PI / 2; const r = 0.45; result[dataIdx] = { ...result[dataIdx], x: result[dataIdx].x + r * Math.cos(angle), y: result[dataIdx].y + r * Math.sin(angle) }; });
  });
  return result;
}

// ── 0. THREAT MAP ──
function ThreatMap({ data }) {
  const t = useTheme();
  const tiers = ["Immediate Threat", "Flanking Threat", "Watch List", "Background"];
  const desc = { "Immediate Threat": "Direct competitors that show up in our deals", "Flanking Threat": "Not head-to-head but stealing adjacent deals", "Watch List": "Fast-growing newcomers or repositioning players", "Background": "Enterprise infrastructure or zero competitive overlap" };
  const icons = { "Immediate Threat": "\uD83D\uDD34", "Flanking Threat": "\uD83D\uDFE0", "Watch List": "\uD83D\uDFE1", "Background": "\u26AB" };

  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Competitive Threat Categorization</h3>
      <p style={{ color: t.textMuted, margin: "0 0 20px", fontSize: 13 }}>{data.length} platforms categorized by competitive relevance to Botpress</p>
      {tiers.map(tier => {
        const td = data.filter(c => c.threatTier === tier);
        if (!td.length) return null;
        return (
          <div key={tier} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{icons[tier]}</span>
              <div>
                <div style={{ color: THREAT_COLORS[tier], fontWeight: 700, fontSize: 16 }}>{tier} ({td.length})</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{desc[tier]}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
              {td.sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).map(c => (
                <div key={c.name} style={{ background: t.surfaceHover, borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${THREAT_COLORS[tier]}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                      <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{c.category} · {c.hq}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: t.accent, fontSize: 12, fontWeight: 600 }}>{c.revenueLabel}</div>
                      <div style={{ color: AI_COLORS[c.aiPosture] || t.textMuted, fontSize: 11 }}>{c.aiPosture}</div>
                    </div>
                  </div>
                  <div style={{ color: t.textMuted, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{c.threatWhy}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ color: t.textMuted, fontSize: 11 }}>AI: {c.aiScore}/10</span>
                    <span style={{ color: t.textMuted, fontSize: 11 }}>{c.pricingModel}</span>
                    {c.fundingOrVal && <span style={{ color: t.textMuted, fontSize: 11 }}>{c.fundingOrVal}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 1. POSITIONING MATRIX ──
const CM = { top: 20, right: 40, bottom: 40, left: 50 };
function PositioningMatrix({ data }) {
  const t = useTheme();
  const [zoom, setZoom] = useState({ x: [0, 11], y: [0, 11] });
  const [ds, setDs] = useState(null);
  const [de, setDe] = useState(null);
  const ref = useRef(null);
  const raw = data.map(c => ({ ...c, x: c.marketBreadth, y: c.automationDepth, z: Math.max(Math.log10(c.revenue || 10) * 120, 80) }));
  const cd = applyJitter(raw);
  const iz = zoom.x[0] !== 0 || zoom.x[1] !== 11 || zoom.y[0] !== 0 || zoom.y[1] !== 11;
  const p2d = (cx, cy) => { if (!ref.current) return null; const r = ref.current.getBoundingClientRect(); const pw = r.width - CM.left - CM.right; const ph = r.height - CM.top - CM.bottom; const nx = (cx - r.left - CM.left) / pw; const ny = (cy - r.top - CM.top) / ph; return { x: Math.max(zoom.x[0], Math.min(zoom.x[1], nx * (zoom.x[1] - zoom.x[0]) + zoom.x[0])), y: Math.max(zoom.y[0], Math.min(zoom.y[1], (1 - ny) * (zoom.y[1] - zoom.y[0]) + zoom.y[0])) }; };
  const rl = (props) => { const { value, index, cx, cy, x, y, width, height } = props; if (!cd[index]) return null; const px = cx ?? (x + (width || 0) / 2); const py = cy ?? (y + (height || 0) / 2); return <text x={px} y={py - 12} textAnchor="middle" dominantBaseline="auto" fill={t.textMuted} fontSize={iz ? 11 : 9} fontWeight={500} style={{ pointerEvents: "none" }}>{value}</text>; };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: t.text, margin: 0, fontSize: 18, fontWeight: 700 }}>Automation Depth vs. Market Breadth</h3>
          <p style={{ color: t.textMuted, margin: "4px 0 0", fontSize: 13 }}>Bubble = log revenue. {data.length} platforms. Drag to zoom.</p>
        </div>
        {iz && <button onClick={() => setZoom({ x: [0, 11], y: [0, 11] })} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reset</button>}
      </div>
      <div ref={ref} onMouseDown={e => { const p = p2d(e.clientX, e.clientY); if (p) { setDs(p); setDe(null); } }} onMouseMove={e => { if (ds) { const p = p2d(e.clientX, e.clientY); if (p) setDe(p); } }} onMouseUp={() => { if (ds && de) { const x1 = Math.min(ds.x, de.x), x2 = Math.max(ds.x, de.x), y1 = Math.min(ds.y, de.y), y2 = Math.max(ds.y, de.y); if (x2 - x1 > 0.3 && y2 - y1 > 0.3) setZoom({ x: [Math.max(0, x1), Math.min(11, x2)], y: [Math.max(0, y1), Math.min(11, y2)] }); } setDs(null); setDe(null); }} onMouseLeave={() => { setDs(null); setDe(null); }} style={{ cursor: "crosshair", userSelect: "none" }}>
        <ResponsiveContainer width="100%" height={560}>
          <ScatterChart margin={CM}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis type="number" dataKey="x" domain={zoom.x} tick={{ fill: t.textMuted, fontSize: 11 }} label={{ value: "Market Breadth \u2192", position: "bottom", offset: 15, fill: t.textMuted, fontSize: 12 }} allowDataOverflow />
            <YAxis type="number" dataKey="y" domain={zoom.y} tick={{ fill: t.textMuted, fontSize: 11 }} label={{ value: "AI Depth \u2192", angle: -90, position: "insideLeft", offset: -10, fill: t.textMuted, fontSize: 12 }} allowDataOverflow />
            <ZAxis type="number" dataKey="z" range={[40, 600]} />
            <Tooltip content={<TT />} />
            <Scatter data={cd} isAnimationActive={false}>
              {cd.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.category] || t.accent} fillOpacity={0.8} stroke={CAT_COLORS[e.category] || t.accent} strokeWidth={1} />)}
              <LabelList dataKey="name" content={rl} />
            </Scatter>
            {ds && de && <ReferenceArea x1={ds.x} x2={de.x} y1={ds.y} y2={de.y} stroke={t.accent} strokeOpacity={0.6} fill={t.accent} fillOpacity={0.1} />}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── 2. REVENUE ──
function RevenueFunding({ data }) {
  const t = useTheme();
  const top = [...data].filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 20);
  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Revenue / ARR Comparison</h3>
      <p style={{ color: t.textMuted, margin: "0 0 16px", fontSize: 13 }}>Top {top.length} platforms by revenue.</p>
      <ResponsiveContainer width="100%" height={Math.max(top.length * 32, 200)}>
        <BarChart data={top} layout="vertical" margin={{ top: 5, right: 50, bottom: 5, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
          <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 11 }} tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`} />
          <YAxis type="category" dataKey="name" tick={{ fill: t.text, fontSize: 12 }} width={110} />
          <Tooltip content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0]?.payload; return (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px" }}><div style={{ fontWeight: 700, color: t.text }}>{d.name}</div><div style={{ color: t.accent, fontSize: 13, marginTop: 4 }}>{d.revenueLabel}</div><div style={{ color: t.textMuted, fontSize: 12 }}>{d.fundingOrVal}</div></div>); }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {top.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.category] || t.accent} fillOpacity={0.85} />)}
            <LabelList dataKey="revenueLabel" position="right" style={{ fill: t.textMuted, fontSize: 10 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 3. PRICING ──
function PricingModels({ data }) {
  const t = useTheme();
  const types = [{ model: "Seat-based", count: 0 }, { model: "Per-resolution", count: 0 }, { model: "Seat + Resolution", count: 0 }, { model: "Usage / Conversation", count: 0 }, { model: "Outcome-based", count: 0 }, { model: "Enterprise custom", count: 0 }, { model: "Managed service", count: 0 }, { model: "Freemium", count: 0 }];
  data.forEach(c => { const pm = c.pricingModel.toLowerCase(); if (pm.includes("managed")) types[6].count++; else if (pm.includes("outcome")) types[4].count++; else if (pm.includes("seat") && (pm.includes("resolution") || pm.includes("add-on") || pm.includes("credit"))) types[2].count++; else if (pm.includes("resolution") && !pm.includes("seat")) types[1].count++; else if (pm.includes("seat") && !pm.includes("resolution")) types[0].count++; else if (pm.includes("freemium")) types[7].count++; else if (pm.includes("usage") || pm.includes("conversation") || pm.includes("contact") || pm.includes("ticket") || pm.includes("issue") || pm.includes("minute") || pm.includes("population")) types[3].count++; else types[5].count++; });
  const pc = [t.accent, t.purple, t.pink, t.cyan, t.success, t.warning, t.orange, t.lime];
  const rd = data.filter(c => c.resolutionPrice).sort((a, b) => a.resolutionPrice - b.resolutionPrice).map(c => ({ name: c.name, price: c.resolutionPrice, category: c.category }));
  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Pricing Model Distribution</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart><Pie data={types.filter(p => p.count > 0)} dataKey="count" nameKey="model" cx="50%" cy="50%" outerRadius={130} innerRadius={60} paddingAngle={2} label={({ model, count }) => `${model} (${count})`} labelLine={{ stroke: t.textMuted }} style={{ fontSize: 11 }}>{types.filter(p => p.count > 0).map((_, i) => <Cell key={i} fill={pc[i % pc.length]} />)}</Pie></PieChart>
        </ResponsiveContainer>
        <div>
          <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Per-Resolution Price Comparison</div>
          {rd.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rd} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                <XAxis dataKey="name" tick={{ fill: t.textMuted, fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {rd.map((e, i) => <Cell key={i} fill={e.price > 1.2 ? t.danger : e.price > 0.8 ? t.orange : t.success} />)}
                  <LabelList dataKey="price" position="top" formatter={v => `$${v.toFixed(2)}`} style={{ fill: t.text, fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
      <div style={{ marginTop: 16, background: t.surfaceHover, borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ color: t.warning, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>The Seat vs. Resolution Tension</div>
        <div style={{ color: t.textMuted, fontSize: 12, lineHeight: 1.6 }}>Zendesk $1.50 is 52% more than Intercom $0.99 and 3x Tidio $0.50. Kustomer conversation-based ($0.35-$0.50) is cheapest at scale. At 500K tickets/month with 60% AI resolution, Zendesk costs ~$5.4M/yr vs. Kustomer ~$3M. Botpress token-based pricing achieves $0.10-$0.30/resolution at scale.</div>
      </div>
    </div>
  );
}

// ── 4. AI MATURITY ──
function AIMaturity({ data }) {
  const t = useTheme();
  const sorted = [...data].sort((a, b) => b.aiScore - a.aiScore);
  const gc = (s) => s >= 9 ? "#7c3aed" : s >= 7 ? "#3b82f6" : s >= 5 ? "#06b6d4" : "#f59e0b";
  const pg = {}; data.forEach(c => { if (!pg[c.aiPosture]) pg[c.aiPosture] = []; pg[c.aiPosture].push(c.name); });
  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>AI Maturity Scorecard</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 6 }}>
        {sorted.map(c => (
          <div key={c.name} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 12px", borderLeft: `4px solid ${gc(c.aiScore)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: t.text, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{c.name}</span>
              <span style={{ color: "#fff", background: gc(c.aiScore), borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{c.aiScore}</span>
            </div>
            <span style={{ color: AI_COLORS[c.aiPosture] || t.textMuted, fontSize: 10 }}>{c.aiPosture}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {Object.entries(pg).map(([p, n]) => (
          <div key={p} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 14px", borderTop: `3px solid ${AI_COLORS[p] || t.textMuted}` }}>
            <div style={{ color: AI_COLORS[p] || t.textMuted, fontWeight: 600, fontSize: 13 }}>{p} ({n.length})</div>
            <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{n.join(", ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 5. DYNAMICS ──
function CompetitiveDynamics({ data }) {
  const t = useTheme();
  const gd = [
    { name: "Sierra", signal: "Explosive", detail: "$0 to $150M+ in <2yrs, $10B val, voice overtook text", score: 10 },
    { name: "Crescendo AI", signal: "Explosive", detail: "$0 to $100M projected in <2yrs, AI+human managed service", score: 10 },
    { name: "Intercom", signal: "Strong", detail: "$400M+ ARR, Fin ~$100M alone, Fin-over-API expanding TAM", score: 9 },
    { name: "Pylon", signal: "Strong", detail: "5x YoY x2 years, 150+ stolen from Zendesk/Intercom/SFDC", score: 8 },
    { name: "Parloa", signal: "Strong", detail: "$50M+ ARR, tripled val to $3B in 8mo, $560M total", score: 8 },
    { name: "Decagon", signal: "Strong", detail: "$481M raised, $4.5B val, 100+ enterprise logos 2025", score: 8 },
    { name: "Giga", signal: "Strong", detail: "Won DoorDash over 20+ vendors, $65M Series A, ~20 staff", score: 8 },
    { name: "Maven AGI", signal: "Promising", detail: "$0 to $7M Y1, 100% renewal on 7-fig deals", score: 7 },
    { name: "Zendesk", signal: "Steady", detail: "$200M AI ARR, 20K AI customers, 5 acquisitions", score: 7 },
    { name: "Capacity", signal: "Steady", detail: "$60M ARR, profitable, 80%+ YoY, 11 acquisitions", score: 6 },
    { name: "Yellow.ai", signal: "Distressed", detail: "100+ layoffs Dec 2025, no funding since Aug 2021", score: 3 },
    { name: "Sprinklr", signal: "Declining", detail: "9% growth (was 18%), cap $7B to $1.5B, class action", score: 3 },
    { name: "Dixa", signal: "Distressed", detail: "$23M rev on $164M raised, no funding since 2021", score: 2 },
  ];
  const names = new Set(data.map(c => c.name));
  const fg = gd.filter(g => names.has(g.name));
  const fl = [
    { attacker: "Intercom Fin-over-API", target: "Zendesk, SFDC, Ada", angle: "Embeddable $0.99/res AI on ANY helpdesk \u2014 Trojan Horse" },
    { attacker: "Pylon", target: "Zendesk / Intercom", angle: "B2B Slack/Teams-native \u2014 150+ direct migrations" },
    { attacker: "Gorgias", target: "Zendesk (e-comm)", angle: "Shopify lock-in, 15K merchants" },
    { attacker: "Sierra", target: "Everyone (F1000)", angle: "Outcome-based AI bypasses helpdesk entirely" },
    { attacker: "Crescendo AI", target: "BPOs + platforms", angle: "Managed service replaces software AND staffing" },
    { attacker: "Parloa", target: "Sierra, Cognigy", angle: "Voice-first, $3B val, DACH/insurance" },
    { attacker: "Kustomer", target: "Zendesk / Intercom", angle: "$0.35-0.50/conv kills per-seat stacking" },
  ];

  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Competitive Dynamics & Growth</h3>
      {fg.length > 0 && (
        <ResponsiveContainer width="100%" height={Math.max(fg.length * 35, 120)}>
          <BarChart data={fg} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
            <XAxis type="number" domain={[0, 10]} tick={{ fill: t.textMuted, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: t.text, fontSize: 12 }} width={90} />
            <Tooltip content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0]?.payload; return (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px" }}><div style={{ fontWeight: 700, color: t.text }}>{d.name} \u2014 {d.signal}</div><div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>{d.detail}</div></div>); }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {fg.map((e, i) => <Cell key={i} fill={e.score >= 8 ? t.success : e.score >= 5 ? t.warning : t.danger} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 10, marginTop: 20 }}>Flanking Moves</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fl.map((f, i) => (
          <div key={i} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 14px", display: "grid", gridTemplateColumns: "160px 16px 160px 1fr", alignItems: "center", gap: 8 }}>
            <span style={{ color: t.success, fontWeight: 700, fontSize: 13 }}>{f.attacker}</span>
            <span style={{ color: t.textMuted }}>{"\u2192"}</span>
            <span style={{ color: t.danger, fontWeight: 600, fontSize: 13 }}>{f.target}</span>
            <span style={{ color: t.textMuted, fontSize: 12 }}>{f.angle}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, background: t.surfaceHover, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${t.danger}` }}>
        <div style={{ color: t.danger, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Consolidation Watch</div>
        <div style={{ color: t.textMuted, fontSize: 12, lineHeight: 1.6 }}>NICE acquires Cognigy ($955M) · Zendesk: 5 acquisitions in 18mo, exits CRM, targets IPO · Meta spins Kustomer ($1B to $250M) · Genesys: $1.5B from Salesforce+ServiceNow · Capacity: 11 acquisitions · Sprinklr: $7B to $1.5B cap · Yellow.ai: layoffs, no new funding</div>
      </div>
    </div>
  );
}

// ── 6. CROSS-CUTTING ANALYSIS ──
function CrossCuttingAnalysis() {
  const t = useTheme();
  const s = [
    { title: "The Market Is Splitting in Two", color: t.danger, content: "AI-native startups growing 200\u2013500% annually are flanking incumbents from below, while enterprise mega-platforms pull the largest accounts upward. The middle tier \u2014 traditional helpdesks without strong AI \u2014 faces existential squeeze. Sierra at $150M+ ARR in <2 years, Intercom Fin approaching $100M in AI-only revenue, and Decagon tripling to $4.5B signal autonomous resolution has moved from buzzword to revenue engine." },
    { title: "Positioning: The Upper-Right Is Dangerously Crowded", color: t.purple, content: "14+ platforms fight for the same enterprise buyers in the high-AI, broad-reach quadrant. White space exists in two areas: (1) agentic AI for narrow verticals \u2014 no \"Sierra for Healthcare\" exists, and (2) agentic AI at SMB price points \u2014 the best autonomous resolution still requires enterprise budgets. Both map directly to Botpress\u2019s strengths as a platform." },
    { title: "Pricing Fragmentation: Five Models, One Winner Emerging", color: t.warning, content: "Spectrum: pure seat-based \u2192 hybrid seat+resolution \u2192 per-resolution \u2192 conversation-based \u2192 managed service. At 500K tickets/month, Zendesk ($5.4M/yr) vs. Kustomer ($3M) = $2.4M gap. Per-resolution creates a \u201Csuccess tax\u201D \u2014 as AI improves, costs double on the same volume. Help Scout\u2019s radical move to contacts-based unlimited seats is the most disruptive model shift. Botpress token-based pricing achieves $0.10\u20130.30/resolution at scale." },
    { title: "Five Consolidation Plays Reshaping the Map", color: t.accent, content: "NICE-Cognigy ($955M): CCaaS buying its AI stack. Zendesk PE spree (5 deals): buy-and-build targeting IPO. Meta-Kustomer ($1B\u2192$250M spinoff): cautionary tale. Capacity (11 acquisitions): mid-market roll-up. Intercom Fin-over-API: the Trojan Horse \u2014 decoupling AI from helpdesk to run on Zendesk/Salesforce. By 2027, three categories: Enterprise CX Suites, AI-First Resolution Platforms, and Vertical Specialists." },
    { title: "Growth: Sierra Dwarfs the Field", color: t.success, content: "Sierra: ~400\u2013500% YoY, 370 employees + 145 open roles, signed SF\u2019s largest office lease since OpenAI. Pylon: ~500% (claimed). Intercom Fin: ~300%+ on AI revenue. Decagon: ~250\u2013350%, tripled to $4.5B. Parloa: ~200%+, tripled to $3B in 8 months. Decelerating: Sprinklr (18%\u21929%), Yellow.ai (layoffs), Five9 core (8\u201310%). Funding drought: Ada, Yellow.ai, Gladly, Dixa, Front, Tidio \u2014 no raises in 3+ years." },
    { title: "Botpress Opportunity", color: t.cyan, content: "The infrastructure layer opportunity is widening. Botpress\u2019s transparent token-based pricing ($0.10\u20130.30/resolution at scale) vs. Intercom $0.99 or Zendesk $1.50 is the single most compelling argument for \u201Cbuild on Botpress\u201D over \u201Cbuy from Sierra.\u201D Two actionable white spaces: SMB-grade agentic AI (nothing delivers Sierra-quality at SMB prices) and vertical-specific autonomous agents. Threat to monitor: Intercom Fin-over-API as \u201Cgood enough\u201D at $0.99 reducing incentive for custom builds." },
  ];
  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Cross-Cutting Competitive Analysis</h3>
      <p style={{ color: t.textMuted, margin: "0 0 20px", fontSize: 13 }}>Strategic synthesis across 36 platforms. March 2026.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {s.map((x, i) => (
          <div key={i} style={{ background: t.surfaceHover, borderRadius: 10, padding: "18px 20px", borderLeft: `4px solid ${x.color}` }}>
            <div style={{ color: x.color, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{x.title}</div>
            <div style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.7 }}>{x.content}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { val: "$2.6B+", label: "Combined AI-first funding (2024\u20132026)", color: t.danger },
          { val: "67%", label: "Intercom Fin avg resolution (benchmark)", color: t.success },
          { val: "5\u21923", label: "Pricing models converging by 2027", color: t.warning },
        ].map((m, i) => (
          <div key={i} style={{ background: t.surfaceHover, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ color: m.color, fontSize: 28, fontWeight: 800 }}>{m.val}</div>
            <div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ──
export default function Dashboard() {
  const [tab, setTab] = useState("threats");
  const [cats, setCats] = useState([...ALL_CATEGORIES]);
  const [mode, setMode] = useState("dark");
  const t = mode === "dark" ? DARK : LIGHT;
  const toggle = (c) => { if (c === "ALL") { setCats([...ALL_CATEGORIES]); return; } setCats(cats.length === 1 && cats[0] === c ? [...ALL_CATEGORIES] : [c]); };
  const f = useMemo(() => competitors.filter(c => cats.includes(c.category)), [cats]);
  const render = () => { switch (tab) { case "threats": return <ThreatMap data={f} />; case "matrix": return <PositioningMatrix data={f} />; case "revenue": return <RevenueFunding data={f} />; case "pricing": return <PricingModels data={f} />; case "aiPosture": return <AIMaturity data={f} />; case "dynamics": return <CompetitiveDynamics data={f} />; case "analysis": return <CrossCuttingAnalysis />; default: return null; } };

  return (
    <ThemeContext.Provider value={t}>
      <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: t.text, padding: "24px 28px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />
              <span style={{ color: t.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Botpress Competitive Intelligence</span>
            </div>
            <button onClick={() => setMode(m => m === "dark" ? "light" : "dark")} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: t.text, fontSize: 13 }}>
              {mode === "dark" ? "\u2600\uFE0F Light" : "\uD83C\uDF19 Dark"}
            </button>
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 800, background: `linear-gradient(135deg, ${t.text}, ${t.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Customer Service \u2014 Competitive Landscape</h1>
          <p style={{ color: t.textMuted, fontSize: 13, margin: "6px 0 0" }}>{f.length} of {competitors.length} platforms \u00B7 March 2026</p>
        </div>
        {tab !== "analysis" && <CategoryFilter selected={cats} onToggle={toggle} />}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.surface, borderRadius: 10, padding: 4, border: `1px solid ${t.border}`, overflowX: "auto" }}>
          {TABS.map(x => <button key={x.id} onClick={() => setTab(x.id)} style={{ background: tab === x.id ? t.accent : "transparent", color: tab === x.id ? "#fff" : t.textMuted, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{x.label}</button>)}
        </div>
        <div style={{ background: t.surface, borderRadius: 12, padding: "24px 28px", border: `1px solid ${t.border}` }}>
          {f.length > 0 || tab === "analysis" ? render() : <div style={{ textAlign: "center", padding: 60, color: t.textMuted }}><div style={{ fontSize: 32, marginBottom: 12 }}>{"\uD83D\uDD0D"}</div><div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>No categories selected</div></div>}
        </div>
        <div style={{ marginTop: 16, color: t.textMuted, fontSize: 11, textAlign: "center" }}>Data: company filings, Crunchbase, Sacra, G2, Gartner, TechCrunch, press releases \u00B7 Estimates flagged \u00B7 Updated March 2026</div>
      </div>
    </ThemeContext.Provider>
  );
}
