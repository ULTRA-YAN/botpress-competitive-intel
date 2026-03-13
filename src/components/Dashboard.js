"use client";

import { useState, useMemo, useRef, createContext, useContext, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
  CartesianGrid, LabelList, ReferenceArea,
} from "recharts";
import dynamic from "next/dynamic";

// ── THEME ──
const THEME = {
  bg: "#0a0a0a",
  bgAlt: "#1a1a1a",
  surface: "rgba(20, 20, 20, 0.75)",
  surfaceSolid: "#141414",
  surfaceHover: "rgba(30, 30, 30, 0.8)",
  border: "rgba(255, 255, 255, 0.12)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  text: "rgba(255, 255, 255, 0.9)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  textFaint: "rgba(255, 255, 255, 0.25)",
  accent: "#e63926",
  accentGreen: "#4ade80",
  purple: "#a78bfa",
  pink: "#f472b6",
  cyan: "#67e8f9",
  warning: "#fbbf24",
  orange: "#fb923c",
  lime: "#a3e635",
  success: "#4ade80",
  danger: "#e63926",
  fontMono: "'Space Mono', monospace",
  fontBody: "'Space Grotesk', sans-serif",
  fontDisplay: "'Playfair Display', serif",
};

const ThemeContext = createContext(THEME);
function useTheme() { return useContext(ThemeContext); }

const CAT_COLORS = {
  "Large Incumbent": "#6b8acd",
  "AI-First": "#a78bfa",
  "Specialist": "#d4a853",
  "Up-and-Coming": "#4ade80",
  "CCaaS / Contact Center": "#f472b6",
  "Managed Service": "#67e8f9",
};

const ALL_CATEGORIES = Object.keys(CAT_COLORS);

const AI_COLORS = {
  "AI-First": "#a78bfa",
  "AI-Forward": "#c4b5fd",
  "Leaning into AI": "#fbbf24",
  "Hybrid": "#67e8f9",
};

// ── CITY COORDINATES ──
const CITY_COORDS = {
  "San Francisco, USA": { lat: 37.7749, lng: -122.4194 },
  "Toronto, Canada": { lat: 43.6532, lng: -79.3832 },
  "Santa Clara, USA": { lat: 37.3541, lng: -121.9552 },
  "Redmond, USA": { lat: 47.6740, lng: -122.1215 },
  "Cambridge, USA": { lat: 42.3736, lng: -71.1097 },
  "Chennai, India": { lat: 13.0827, lng: 80.2707 },
  "Düsseldorf, Germany": { lat: 51.2277, lng: 6.7735 },
  "Menlo Park, USA": { lat: 37.4530, lng: -122.1817 },
  "Armonk, USA": { lat: 41.1265, lng: -73.7140 },
  "San Ramon, USA": { lat: 37.7799, lng: -121.9780 },
  "Palo Alto, USA": { lat: 37.4419, lng: -122.1430 },
  "New York, USA": { lat: 40.7128, lng: -74.0060 },
  "Copenhagen, Denmark": { lat: 55.6761, lng: 12.5683 },
  "Boston, USA": { lat: 42.3601, lng: -71.0589 },
  "St. Louis, USA": { lat: 38.6270, lng: -90.1994 },
  "Berlin, Germany": { lat: 52.5200, lng: 13.4050 },
  "Bangalore, India": { lat: 12.9716, lng: 77.5946 },
  "San Mateo, USA": { lat: 37.5630, lng: -122.3255 },
  "Short Hills, USA": { lat: 40.7479, lng: -74.3246 },
  "Keller, USA": { lat: 32.9346, lng: -97.2295 },
};

// ── BACKGROUND IMAGES ──
const BG_IMAGES = {
  hero: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  dynamics: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&q=80",
  matrix: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
  revenue: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
  pricing: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80",
  aiPosture: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80",
  hqMap: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
  liveIntel: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80",
};

// ── DATA ──
const competitors = [
  { name: "Zendesk", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 1950, revenueLabel: "$1.9B+ (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat + Resolution + Add-ons", resolutionPrice: 1.5, seatPrice: 115, fundingOrVal: "$10.2B (PE buyout)", founded: 2007, automationRate: "Up to 80% (unverified)", customers: 100000, aiScore: 7, marketBreadth: 10, automationDepth: 7 },
  { name: "Intercom", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 400, revenueLabel: "$400M ARR", aiPosture: "AI-Forward", pricingModel: "Seat + Resolution", resolutionPrice: 0.99, seatPrice: 85, fundingOrVal: "$240M raised", founded: 2011, automationRate: "67% avg", customers: 25000, aiScore: 9, marketBreadth: 8, automationDepth: 8 },
  { name: "Salesforce Service Cloud", category: "Large Incumbent", hq: "San Francisco, USA", revenue: 8500, revenueLabel: "$8.5B (Service Cloud est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 165, fundingOrVal: "Public (NYSE: CRM)", founded: 1999, automationRate: "N/A", customers: 150000, aiScore: 6, marketBreadth: 10, automationDepth: 5 },
  { name: "ServiceNow", category: "Large Incumbent", hq: "Santa Clara, USA", revenue: 13300, revenueLabel: "$13.3B total rev", aiPosture: "Leaning into AI", pricingModel: "Enterprise license", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NYSE: NOW)", founded: 2004, automationRate: "N/A", customers: 8100, aiScore: 7, marketBreadth: 9, automationDepth: 6 },
  { name: "Microsoft D365", category: "Large Incumbent", hq: "Redmond, USA", revenue: 6000, revenueLabel: "$6B+ (D365 est.)", aiPosture: "Leaning into AI", pricingModel: "Seat + Copilot Credits", resolutionPrice: null, seatPrice: 105, fundingOrVal: "Public (NASDAQ: MSFT)", founded: 1975, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 9, automationDepth: 5 },
  { name: "HubSpot Service Hub", category: "Large Incumbent", hq: "Cambridge, USA", revenue: 2600, revenueLabel: "$2.6B total HubSpot", aiPosture: "Leaning into AI", pricingModel: "Seat + Credits", resolutionPrice: null, seatPrice: 90, fundingOrVal: "Public (NYSE: HUBS)", founded: 2006, automationRate: "50%+ claimed", customers: 228000, aiScore: 5, marketBreadth: 8, automationDepth: 4 },
  { name: "Zoho Desk", category: "Large Incumbent", hq: "Chennai, India", revenue: 1400, revenueLabel: "$1.4B (Zoho Corp)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 40, fundingOrVal: "Bootstrapped", founded: 1996, automationRate: "N/A", customers: null, aiScore: 3, marketBreadth: 7, automationDepth: 3 },
  { name: "Sierra", category: "AI-First", hq: "San Francisco, USA", revenue: 150, revenueLabel: "$100M+ ARR", aiPosture: "AI-First", pricingModel: "Outcome-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$635M / $10B val", founded: 2023, automationRate: "70%+ claimed", customers: null, aiScore: 10, marketBreadth: 5, automationDepth: 10 },
  { name: "Decagon", category: "AI-First", hq: "San Francisco, USA", revenue: 50, revenueLabel: "~$50M+ (est.)", aiPosture: "AI-First", pricingModel: "Per-conversation / resolution", resolutionPrice: null, seatPrice: null, fundingOrVal: "$100M / $1B+ val", founded: 2023, automationRate: "N/A", customers: null, aiScore: 10, marketBreadth: 4, automationDepth: 9 },
  { name: "Ada", category: "AI-First", hq: "Toronto, Canada", revenue: 70, revenueLabel: "$70.6M rev", aiPosture: "AI-First", pricingModel: "Per-resolution", resolutionPrice: 2.25, seatPrice: null, fundingOrVal: "$200M / $1.2B val", founded: 2016, automationRate: "70% (claimed)", customers: null, aiScore: 9, marketBreadth: 6, automationDepth: 9 },
  { name: "Forethought", category: "AI-First", hq: "San Francisco, USA", revenue: 30, revenueLabel: "~$30M (est.)", aiPosture: "AI-First", pricingModel: "Usage-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$115M+ raised", founded: 2018, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 5, automationDepth: 8 },
  { name: "Cognigy (NICE)", category: "AI-First", hq: "Düsseldorf, Germany", revenue: 40, revenueLabel: "~$40M (pre-acq est.)", aiPosture: "AI-First", pricingModel: "Enterprise subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "Acquired $955M", founded: 2016, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 6, automationDepth: 8 },
  { name: "Maven AGI", category: "AI-First", hq: "Boston, USA", revenue: 7, revenueLabel: "~$7M rev", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$78M raised", founded: 2023, automationRate: "93% claimed", customers: 40, aiScore: 9, marketBreadth: 3, automationDepth: 9 },
  { name: "Crescendo AI", category: "Managed Service", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M+ ARR (projected)", aiPosture: "AI-First", pricingModel: "Managed service", resolutionPrice: null, seatPrice: null, fundingOrVal: "$50M / $500M val", founded: 2024, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 4, automationDepth: 8 },
  { name: "Gorgias", category: "Specialist", hq: "San Francisco, USA", revenue: 71, revenueLabel: "$69-73M ARR", aiPosture: "Hybrid", pricingModel: "Ticket + Resolution", resolutionPrice: 0.90, seatPrice: null, fundingOrVal: "$96M raised", founded: 2015, automationRate: "N/A", customers: 15000, aiScore: 6, marketBreadth: 3, automationDepth: 7 },
  { name: "Gladly", category: "Specialist", hq: "San Francisco, USA", revenue: 48, revenueLabel: "$47.7M rev", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$208M raised", founded: 2014, automationRate: "N/A", customers: null, aiScore: 6, marketBreadth: 3, automationDepth: 6 },
  { name: "DevRev", category: "Specialist", hq: "Palo Alto, USA", revenue: 15, revenueLabel: "~$15M (est.)", aiPosture: "AI-First", pricingModel: "Issue-based", resolutionPrice: null, seatPrice: 25, fundingOrVal: "$150M+ / $1.15B val", founded: 2020, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 3, automationDepth: 7 },
  { name: "Helpshift", category: "Specialist", hq: "San Francisco, USA", revenue: 25, revenueLabel: "~$25M (est.)", aiPosture: "Hybrid", pricingModel: "Ticket-based", resolutionPrice: 0.90, seatPrice: null, fundingOrVal: "Acquired $75M", founded: 2011, automationRate: "N/A", customers: null, aiScore: 5, marketBreadth: 2, automationDepth: 6 },
  { name: "Polimorphic", category: "Specialist", hq: "New York, USA", revenue: 5, revenueLabel: "~$5M (est.)", aiPosture: "AI-First", pricingModel: "Population-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$28M raised", founded: 2022, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 1, automationDepth: 7 },
  { name: "Kustomer", category: "Up-and-Coming", hq: "New York, USA", revenue: 35, revenueLabel: "~$35M (est.)", aiPosture: "AI-First", pricingModel: "Conversation-based", resolutionPrice: 0.60, seatPrice: 89, fundingOrVal: "$250M val (2023)", founded: 2015, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 5, automationDepth: 7 },
  { name: "Sprinklr", category: "Up-and-Coming", hq: "New York, USA", revenue: 796, revenueLabel: "$796M rev", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 249, fundingOrVal: "Public (NYSE: CXM)", founded: 2009, automationRate: "N/A", customers: null, aiScore: 6, marketBreadth: 7, automationDepth: 5 },
  { name: "Front", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M ARR", aiPosture: "Leaning into AI", pricingModel: "Seat + Resolution", resolutionPrice: 0.70, seatPrice: 65, fundingOrVal: "$204M / $1.7B val", founded: 2013, automationRate: "N/A", customers: 9000, aiScore: 5, marketBreadth: 5, automationDepth: 5 },
  { name: "Dixa", category: "Up-and-Coming", hq: "Copenhagen, Denmark", revenue: 25, revenueLabel: "~$25M (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 109, fundingOrVal: "$155M raised", founded: 2015, automationRate: "N/A", customers: null, aiScore: 5, marketBreadth: 4, automationDepth: 5 },
  { name: "Help Scout", category: "Up-and-Coming", hq: "Boston, USA", revenue: 36, revenueLabel: "$36M rev", aiPosture: "Leaning into AI", pricingModel: "Contacts-based", resolutionPrice: 0.75, seatPrice: null, fundingOrVal: "$14M raised", founded: 2011, automationRate: "N/A", customers: 12000, aiScore: 5, marketBreadth: 4, automationDepth: 4 },
  { name: "Tidio", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 20, revenueLabel: "~$20M (est.)", aiPosture: "Hybrid", pricingModel: "Freemium + conversation", resolutionPrice: 0.50, seatPrice: 29, fundingOrVal: "$26.8M raised", founded: 2013, automationRate: "67% (Lyro)", customers: 300000, aiScore: 5, marketBreadth: 4, automationDepth: 5 },
  { name: "Pylon", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 10, revenueLabel: "~$10M (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$51M raised", founded: 2022, automationRate: "N/A", customers: 780, aiScore: 6, marketBreadth: 3, automationDepth: 5 },
  { name: "Parloa", category: "AI-First", hq: "Berlin, Germany", revenue: 15, revenueLabel: "~$15M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$96M raised", founded: 2018, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 4, automationDepth: 9 },
  { name: "Giga", category: "AI-First", hq: "San Francisco, USA", revenue: 10, revenueLabel: "~$10M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$65M raised", founded: 2023, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 2, automationDepth: 9 },
  { name: "Capacity", category: "Up-and-Coming", hq: "St. Louis, USA", revenue: 60, revenueLabel: "$60M ARR", aiPosture: "Hybrid", pricingModel: "Mid-market subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "$155M+ raised", founded: 2017, automationRate: "N/A", customers: 19000, aiScore: 5, marketBreadth: 5, automationDepth: 5 },
  { name: "Nurix AI", category: "AI-First", hq: "Bangalore, India", revenue: 3, revenueLabel: "~$3M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$27.5M raised", founded: 2024, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 2, automationDepth: 8 },
  { name: "Synthflow AI", category: "AI-First", hq: "Berlin, Germany", revenue: 8, revenueLabel: "~$8M (est.)", aiPosture: "AI-First", pricingModel: "Usage-based (minutes)", resolutionPrice: null, seatPrice: 29, fundingOrVal: "$30M raised", founded: 2023, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 4, automationDepth: 7 },
  { name: "Five9", category: "CCaaS / Contact Center", hq: "San Ramon, USA", revenue: 1150, revenueLabel: "$1.15B rev", aiPosture: "Leaning into AI", pricingModel: "Seat + per-minute AI", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NASDAQ: FIVN)", founded: 2001, automationRate: "N/A", customers: 3000, aiScore: 6, marketBreadth: 7, automationDepth: 5 },
  { name: "Genesys", category: "CCaaS / Contact Center", hq: "Menlo Park, USA", revenue: 2200, revenueLabel: "$2.2B Cloud ARR", aiPosture: "Leaning into AI", pricingModel: "Seat + AI consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "Private", founded: 1990, automationRate: "N/A", customers: 8000, aiScore: 7, marketBreadth: 9, automationDepth: 6 },
  { name: "IBM watsonx", category: "CCaaS / Contact Center", hq: "Armonk, USA", revenue: null, revenueLabel: "Part of IBM ($60B+)", aiPosture: "Leaning into AI", pricingModel: "Subscription + consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NYSE: IBM)", founded: 1911, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 6, automationDepth: 6 },
  { name: "Yellow.ai", category: "AI-First", hq: "San Mateo, USA", revenue: 80, revenueLabel: "$79.5M rev", aiPosture: "Hybrid", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$102M+ raised", founded: 2016, automationRate: "N/A", customers: 1100, aiScore: 7, marketBreadth: 7, automationDepth: 7 },
];

// ── TABS ──
const TABS = [
  { id: "dynamics", label: "Dynamics" },
  { id: "matrix", label: "Positioning" },
  { id: "revenue", label: "Revenue" },
  { id: "pricing", label: "Pricing" },
  { id: "aiPosture", label: "AI Maturity" },
  { id: "hqMap", label: "HQ Map" },
  { id: "latestNews", label: "Latest News" },
];

// ── SHARED STYLES ──
const GLASS = {
  background: "rgba(20, 20, 20, 0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 4,
};

const SECTION_LABEL = (t) => ({
  fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase",
  letterSpacing: "0.2em", color: t.accent, marginBottom: 8,
});

const SECTION_HEADING = (t) => ({
  fontFamily: t.fontDisplay, fontSize: 30, fontWeight: 400,
  color: t.text, margin: "0 0 8px", lineHeight: 1.2,
});

const BODY_TEXT = (t) => ({
  fontFamily: t.fontBody, fontSize: 13, color: t.textMuted, lineHeight: 1.7,
});

const DIVIDER = { borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "24px 0" };

// ── TOOLTIP ──
function TT({ active, payload }) {
  const t = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ ...GLASS, padding: "14px 18px", maxWidth: 280, zIndex: 50 }}>
      <div style={{ fontWeight: 700, color: t.text, fontSize: 14, fontFamily: t.fontBody }}>{d.name}</div>
      <div style={{ color: t.textMuted, fontSize: 11, marginTop: 3, fontFamily: t.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.category} · {d.hq}</div>
      {d.revenueLabel && <div style={{ color: t.accent, fontSize: 12, marginTop: 8, fontFamily: t.fontBody }}>Revenue: {d.revenueLabel}</div>}
      {d.aiPosture && <div style={{ color: AI_COLORS[d.aiPosture] || t.textMuted, fontSize: 12, fontFamily: t.fontBody }}>AI: {d.aiPosture}</div>}
      {d.pricingModel && <div style={{ color: t.textMuted, fontSize: 12, fontFamily: t.fontBody }}>Pricing: {d.pricingModel}</div>}
    </div>
  );
}

// ── CATEGORY FILTER ──
function CategoryFilter({ selected, onToggle }) {
  const t = useTheme();
  const allSelected = selected.length === ALL_CATEGORIES.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
      <button
        onClick={() => onToggle("ALL")}
        style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em",
          color: allSelected ? t.text : t.textFaint, transition: "color 0.2s",
        }}
      >
        {allSelected && <span style={{ color: t.accent, marginRight: 6 }}>{"\u25AA"}</span>}
        All ({competitors.length})
      </button>
      {ALL_CATEGORIES.map(cat => {
        const active = selected.includes(cat) && !allSelected;
        const count = competitors.filter(c => c.category === cat).length;
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            style={{
              background: "transparent", border: "none", cursor: "pointer", padding: 0,
              fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em",
              color: active ? CAT_COLORS[cat] : t.textFaint, transition: "color 0.2s",
            }}
          >
            {active && <span style={{ color: t.accent, marginRight: 6 }}>{"\u25AA"}</span>}
            {cat} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ── JITTER HELPER ──
function applyJitter(data) {
  const groups = {};
  data.forEach((item, idx) => {
    const key = `${item.x},${item.y}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(idx);
  });
  const result = data.map(item => ({ ...item }));
  Object.values(groups).forEach(indices => {
    if (indices.length <= 1) return;
    indices.forEach((dataIdx, i) => {
      const angle = (2 * Math.PI * i) / indices.length - Math.PI / 2;
      const radius = 0.45;
      result[dataIdx] = {
        ...result[dataIdx],
        x: result[dataIdx].x + radius * Math.cos(angle),
        y: result[dataIdx].y + radius * Math.sin(angle),
      };
    });
  });
  return result;
}

// ── 1. POSITIONING MATRIX ──
const CHART_MARGIN = { top: 20, right: 40, bottom: 40, left: 50 };

function PositioningMatrix({ data }) {
  const t = useTheme();
  const [zoom, setZoom] = useState({ x: [0, 11], y: [0, 11] });
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const chartRef = useRef(null);

  const rawData = data.map(c => ({
    ...c, x: c.marketBreadth, y: c.automationDepth,
    z: Math.max(Math.log10(c.revenue || 10) * 120, 80),
  }));
  const chartData = applyJitter(rawData);
  const isZoomed = zoom.x[0] !== 0 || zoom.x[1] !== 11 || zoom.y[0] !== 0 || zoom.y[1] !== 11;

  const pixelToDomain = (clientX, clientY) => {
    if (!chartRef.current) return null;
    const rect = chartRef.current.getBoundingClientRect();
    const plotW = rect.width - CHART_MARGIN.left - CHART_MARGIN.right;
    const plotH = rect.height - CHART_MARGIN.top - CHART_MARGIN.bottom;
    const normX = (clientX - rect.left - CHART_MARGIN.left) / plotW;
    const normY = (clientY - rect.top - CHART_MARGIN.top) / plotH;
    return {
      x: Math.max(zoom.x[0], Math.min(zoom.x[1], normX * (zoom.x[1] - zoom.x[0]) + zoom.x[0])),
      y: Math.max(zoom.y[0], Math.min(zoom.y[1], (1 - normY) * (zoom.y[1] - zoom.y[0]) + zoom.y[0])),
    };
  };

  const handleMouseDown = (e) => { if (e.button !== 0) return; const pt = pixelToDomain(e.clientX, e.clientY); if (pt) { setDragStart(pt); setDragEnd(null); } };
  const handleMouseMove = (e) => { if (!dragStart) return; const pt = pixelToDomain(e.clientX, e.clientY); if (pt) setDragEnd(pt); };
  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const x1 = Math.min(dragStart.x, dragEnd.x), x2 = Math.max(dragStart.x, dragEnd.x);
      const y1 = Math.min(dragStart.y, dragEnd.y), y2 = Math.max(dragStart.y, dragEnd.y);
      if (x2 - x1 > 0.3 && y2 - y1 > 0.3) setZoom({ x: [Math.max(0, x1), Math.min(11, x2)], y: [Math.max(0, y1), Math.min(11, y2)] });
    }
    setDragStart(null); setDragEnd(null);
  };

  const handleWheel = (e) => {
    if (!e.metaKey && !e.ctrlKey) return;
    e.preventDefault();
    const pt = pixelToDomain(e.clientX, e.clientY);
    if (!pt) return;
    const factor = e.deltaY < 0 ? 0.8 : 1.25;
    const xRange = zoom.x[1] - zoom.x[0], yRange = zoom.y[1] - zoom.y[0];
    const newXRange = Math.min(11, xRange * factor), newYRange = Math.min(11, yRange * factor);
    if (newXRange >= 11 && newYRange >= 11) { setZoom({ x: [0, 11], y: [0, 11] }); return; }
    const xRatio = (pt.x - zoom.x[0]) / xRange, yRatio = (pt.y - zoom.y[0]) / yRange;
    setZoom({
      x: [Math.max(0, pt.x - xRatio * newXRange), Math.min(11, pt.x + (1 - xRatio) * newXRange)],
      y: [Math.max(0, pt.y - yRatio * newYRange), Math.min(11, pt.y + (1 - yRatio) * newYRange)],
    });
  };

  const renderLabel = (props) => {
    const { value, index, cx, cy, x, y, width, height } = props;
    const item = chartData[index];
    if (!item) return null;
    const centerX = cx ?? (x + (width || 0) / 2);
    const centerY = cy ?? (y + (height || 0) / 2);
    return (
      <text x={centerX} y={centerY - 12} textAnchor="middle" dominantBaseline="auto" fill="rgba(255,255,255,0.5)" fontSize={isZoomed ? 11 : 9} fontWeight={500} fontFamily="Space Mono, monospace" style={{ pointerEvents: "none" }}>
        {value}
      </text>
    );
  };

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} Positioning Matrix</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={SECTION_HEADING(t)}>Automation Depth vs. Market Breadth</h3>
          <p style={BODY_TEXT(t)}>Bubble size = log revenue. {data.length} platforms. {"\u2318"}+scroll to zoom, drag to select.</p>
        </div>
        {isZoomed && (
          <button onClick={() => setZoom({ x: [0, 11], y: [0, 11] })} style={{
            background: t.accent, color: "#fff", border: "none", borderRadius: 2,
            padding: "6px 14px", fontSize: 10, fontFamily: t.fontMono, fontWeight: 700,
            cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
          }}>Reset</button>
        )}
      </div>
      <div ref={chartRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { setDragStart(null); setDragEnd(null); }} onWheel={handleWheel} style={{ cursor: "crosshair", userSelect: "none", marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={560}>
          <ScatterChart margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" dataKey="x" domain={zoom.x} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} label={{ value: "Market Breadth \u2192", position: "bottom", offset: 15, fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} allowDataOverflow />
            <YAxis type="number" dataKey="y" domain={zoom.y} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} label={{ value: "AI Automation Depth \u2192", angle: -90, position: "insideLeft", offset: -10, fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} allowDataOverflow />
            <ZAxis type="number" dataKey="z" range={[40, 600]} />
            <Tooltip content={<TT />} />
            <Scatter data={chartData} isAnimationActive={false}>
              {chartData.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.category] || t.accent} fillOpacity={0.75} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />)}
              <LabelList dataKey="name" content={renderLabel} />
            </Scatter>
            {dragStart && dragEnd && (
              <ReferenceArea x1={dragStart.x} x2={dragEnd.x} y1={dragStart.y} y2={dragEnd.y} stroke={t.accent} strokeOpacity={0.6} fill={t.accent} fillOpacity={0.1} />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {[
          { label: "AI Leaders", desc: "High depth, Broad reach", names: "Sierra, Intercom, Ada, Decagon", color: t.purple },
          { label: "Incumbents", desc: "Broad reach, Lower AI", names: "Zendesk, Salesforce, ServiceNow, Microsoft", color: "#6b8acd" },
          { label: "AI Niche", desc: "High depth, Narrow", names: "Parloa, Giga, Maven AGI, Nurix", color: t.pink },
          { label: "Traditional Niche", desc: "Lower depth, Narrow", names: "Help Scout, Tidio, Dixa, Pylon", color: t.warning },
        ].map(q => (
          <div key={q.label} style={{ borderTop: `1px solid ${q.color}`, paddingTop: 10 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: q.color }}>{q.label}</div>
            <div style={{ fontFamily: t.fontBody, color: t.textMuted, fontSize: 11, marginTop: 4 }}>{q.names}</div>
          </div>
        ))}
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
      <div style={SECTION_LABEL(t)}>{"\u25AA"} Revenue & Funding</div>
      <h3 style={SECTION_HEADING(t)}>Revenue / ARR Comparison</h3>
      <p style={{ ...BODY_TEXT(t), marginBottom: 24 }}>{top.length} platforms. Mix of public filings, reported ARR, and industry estimates.</p>
      <ResponsiveContainer width="100%" height={Math.max(top.length * 32, 200)}>
        <BarChart data={top} layout="vertical" margin={{ top: 5, right: 50, bottom: 5, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`} />
          <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 11, fontFamily: "Space Grotesk" }} width={110} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ ...GLASS, padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14, fontFamily: t.fontBody }}>{d.name}</div>
                <div style={{ color: t.accent, fontSize: 13, marginTop: 4, fontFamily: t.fontBody }}>{d.revenueLabel}</div>
                <div style={{ color: t.textMuted, fontSize: 12, fontFamily: t.fontBody }}>{d.fundingOrVal}</div>
                <div style={{ color: t.textFaint, fontSize: 10, marginTop: 4, fontFamily: t.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.category}</div>
              </div>
            );
          }} />
          <Bar dataKey="revenue" radius={[0, 2, 2, 0]}>
            {top.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.category] || t.accent} fillOpacity={0.75} />)}
            <LabelList dataKey="revenueLabel" position="right" style={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Space Mono" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 3. PRICING ──
function PricingModels({ data }) {
  const t = useTheme();
  const types = [
    { model: "Seat-based", count: 0 }, { model: "Per-resolution", count: 0 },
    { model: "Seat + Resolution", count: 0 }, { model: "Usage / Conversation", count: 0 },
    { model: "Outcome-based", count: 0 }, { model: "Enterprise custom", count: 0 },
    { model: "Managed service", count: 0 }, { model: "Freemium", count: 0 },
  ];
  data.forEach(c => {
    const pm = c.pricingModel.toLowerCase();
    if (pm.includes("managed")) types[6].count++;
    else if (pm.includes("outcome")) types[4].count++;
    else if (pm.includes("seat") && (pm.includes("resolution") || pm.includes("add-on"))) types[2].count++;
    else if (pm.includes("resolution") && !pm.includes("seat")) types[1].count++;
    else if (pm.includes("seat") && !pm.includes("resolution")) types[0].count++;
    else if (pm.includes("freemium") || pm.includes("free")) types[7].count++;
    else if (pm.includes("usage") || pm.includes("conversation") || pm.includes("contact") || pm.includes("ticket") || pm.includes("issue") || pm.includes("minute") || pm.includes("population")) types[3].count++;
    else types[5].count++;
  });
  const pieColors = ["#6b8acd", "#a78bfa", "#f472b6", "#67e8f9", "#4ade80", "#fbbf24", "#fb923c", "#a3e635"];
  const resData = data.filter(c => c.resolutionPrice).sort((a, b) => a.resolutionPrice - b.resolutionPrice).map(c => ({ name: c.name, price: c.resolutionPrice, category: c.category }));

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} Pricing Models</div>
      <h3 style={SECTION_HEADING(t)}>Pricing Model Distribution</h3>
      <p style={{ ...BODY_TEXT(t), marginBottom: 24 }}>{data.length} platforms.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie data={types.filter(p => p.count > 0)} dataKey="count" nameKey="model" cx="50%" cy="50%" outerRadius={130} innerRadius={70} paddingAngle={2} label={({ model, count }) => `${model} (${count})`} labelLine={{ stroke: "rgba(255,255,255,0.2)" }} style={{ fontSize: 10, fontFamily: "Space Mono" }}>
                {types.filter(p => p.count > 0).map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} fillOpacity={0.75} />)}
              </Pie>
              <Tooltip contentStyle={{ ...GLASS, fontSize: 12, color: t.text }} itemStyle={{ color: t.text }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted, marginBottom: 16 }}>{"\u25AA"} Per-Resolution Prices</div>
          {resData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "Space Mono" }} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} tickFormatter={v => `$${v.toFixed(2)}`} domain={[0, "auto"]} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`, "Per Resolution"]} contentStyle={{ ...GLASS, fontSize: 12, color: t.text }} itemStyle={{ color: t.text }} labelStyle={{ color: t.textMuted }} />
                <Bar dataKey="price" radius={[2, 2, 0, 0]}>
                  {resData.map((e, i) => <Cell key={i} fill={e.name === "Zendesk" ? t.danger : e.name === "Ada" ? t.orange : e.name === "Intercom" ? t.warning : t.success} fillOpacity={0.75} />)}
                  <LabelList dataKey="price" position="top" formatter={v => `$${v.toFixed(2)}`} style={{ fill: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 600, fontFamily: "Space Mono" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: t.textMuted, fontSize: 13, padding: 40, textAlign: "center", fontFamily: t.fontBody }}>No platforms with published per-resolution pricing in this selection.</div>
          )}
        </div>
      </div>
      <div style={{ ...GLASS, marginTop: 24, padding: "16px 20px", borderLeft: `2px solid ${t.accent}` }}>
        <div style={{ ...SECTION_LABEL(t), marginBottom: 6 }}>{"\u25AA"} Key Insight</div>
        <div style={{ fontFamily: t.fontBody, fontWeight: 600, color: t.text, fontSize: 14, marginBottom: 6 }}>The Seat vs. Resolution Tension</div>
        <div style={BODY_TEXT(t)}>
          Zendesk&apos;s $1.50/resolution is 52% more expensive than Intercom&apos;s $0.99 and 3x Tidio&apos;s $0.50. The market is splitting: incumbents stack seat + resolution fees, while AI-first players move to pure usage/outcome models. Botpress&apos;s transparent pricing undercuts both approaches.
        </div>
      </div>
    </div>
  );
}

// ── 4. AI MATURITY ──
function AIMaturity({ data }) {
  const t = useTheme();
  const sorted = [...data].sort((a, b) => b.aiScore - a.aiScore);
  const getColor = (s) => s >= 9 ? "#a78bfa" : s >= 7 ? "#6b8acd" : s >= 5 ? "#67e8f9" : s >= 3 ? "#fbbf24" : "rgba(255,255,255,0.3)";
  const postureGroups = {};
  data.forEach(c => {
    if (!postureGroups[c.aiPosture]) postureGroups[c.aiPosture] = [];
    postureGroups[c.aiPosture].push(c.name);
  });

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} AI Maturity</div>
      <h3 style={SECTION_HEADING(t)}>AI Maturity Scorecard</h3>
      <p style={{ ...BODY_TEXT(t), marginBottom: 24 }}>{data.length} platforms. Scored 1-10 on AI capability depth.</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sorted.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <span style={{ fontFamily: t.fontDisplay, fontSize: 28, fontWeight: 400, color: getColor(c.aiScore), minWidth: 44, textAlign: "right" }}>{c.aiScore}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: t.text }}>{c.name}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: AI_COLORS[c.aiPosture] || t.textMuted, marginTop: 2 }}>{c.aiPosture}</div>
            </div>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint }}>{c.category}</span>
          </div>
        ))}
      </div>
      {Object.keys(postureGroups).length > 0 && (
        <>
          <div style={DIVIDER} />
          <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted, marginBottom: 16 }}>{"\u25AA"} AI Posture Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {Object.entries(postureGroups).map(([posture, names]) => (
              <div key={posture} style={{ borderTop: `1px solid ${AI_COLORS[posture] || t.textFaint}`, paddingTop: 12 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: AI_COLORS[posture] || t.textMuted, marginBottom: 4 }}>{posture} ({names.length})</div>
                <div style={{ fontFamily: t.fontBody, color: t.textMuted, fontSize: 11, lineHeight: 1.6 }}>{names.join(", ")}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── 5. COMPETITIVE DYNAMICS ──
function CompetitiveDynamics({ data }) {
  const t = useTheme();
  const allGrowth = [
    { name: "Sierra", signal: "Explosive", detail: "$0\u2192$100M ARR in 7 quarters, $10B val", score: 10, category: "AI-First" },
    { name: "Crescendo", signal: "Explosive", detail: "$0\u2192$100M projected in <2 years", score: 10, category: "Managed Service" },
    { name: "Intercom", signal: "Strong", detail: "$400M ARR, Fin approaching $100M alone", score: 9, category: "Large Incumbent" },
    { name: "Pylon", signal: "Strong", detail: "5x+ YoY growth, 150 stolen from Zendesk", score: 8, category: "Up-and-Coming" },
    { name: "Giga", signal: "Strong", detail: "DoorDash win, $65M Series A", score: 8, category: "AI-First" },
    { name: "Maven AGI", signal: "Promising", detail: "$0\u2192$7M Y1, 93% resolution claim", score: 7, category: "AI-First" },
    { name: "Zendesk", signal: "Steady", detail: "$200M AI ARR, 20K AI customers", score: 7, category: "Large Incumbent" },
    { name: "Decagon", signal: "Promising", detail: "$100M raise, $1B+ val, top-tier logos", score: 7, category: "AI-First" },
    { name: "Gladly", signal: "Recovering", detail: "+56% YoY to $48M, new $40M round", score: 6, category: "Specialist" },
    { name: "Kustomer", signal: "Reinventing", detail: "Conversation pricing pivot, post-Meta rebuild", score: 5, category: "Up-and-Coming" },
    { name: "Sprinklr", signal: "Declining", detail: "9% growth (was 18%), class action, churn", score: 3, category: "Up-and-Coming" },
    { name: "Helpshift", signal: "Niche-locked", detail: "Gaming-only under Keywords Studios", score: 2, category: "Specialist" },
  ];
  const names = new Set(data.map(c => c.name));
  const growthData = allGrowth.filter(g => names.has(g.name));
  const flanking = [
    { attacker: "Pylon", target: "Zendesk / Intercom", angle: "B2B-specific support (Slack/Teams native) \u2014 stealing 150+ customers directly" },
    { attacker: "Gorgias", target: "Zendesk", angle: "Shopify-native vertical lock-in \u2014 cheaper, deeper e-commerce integration" },
    { attacker: "Sierra", target: "Everyone", angle: "Fortune 1000 outcome-based AI \u2014 bypasses helpdesk entirely" },
    { attacker: "Crescendo", target: "BPOs + platforms", angle: "Managed AI service replaces both software AND staffing" },
    { attacker: "Kustomer", target: "Zendesk / Intercom", angle: "Conversation-based pricing eliminates per-seat + per-resolution stacking" },
    { attacker: "Help Scout", target: "Zendesk (SMB)", angle: "Contacts-based pricing with unlimited seats \u2014 anti-Zendesk pricing" },
  ].filter(f => names.has(f.attacker));

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} Competitive Dynamics</div>
      <h3 style={SECTION_HEADING(t)}>Growth Trajectories & Battle Lines</h3>
      <p style={{ ...BODY_TEXT(t), marginBottom: 24 }}>{growthData.length} platforms with growth signals.</p>
      {growthData.length > 0 ? (
        <>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted, marginBottom: 16 }}>{"\u25AA"} Growth Momentum</div>
          <ResponsiveContainer width="100%" height={Math.max(growthData.length * 35, 120)}>
            <BarChart data={growthData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Space Mono" }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 11, fontFamily: "Space Grotesk" }} width={80} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ ...GLASS, padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: t.text, fontFamily: t.fontBody }}>{d.name}</div>
                    <div style={{ color: t.accent, fontSize: 12, marginTop: 2, fontFamily: t.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.signal}</div>
                    <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2, fontFamily: t.fontBody }}>{d.detail}</div>
                  </div>
                );
              }} />
              <Bar dataKey="score" radius={[0, 2, 2, 0]}>
                {growthData.map((e, i) => <Cell key={i} fill={e.score >= 8 ? t.success : e.score >= 5 ? t.warning : t.danger} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div style={{ color: t.textMuted, fontSize: 13, padding: 40, textAlign: "center", fontFamily: t.fontBody }}>No growth data for selected categories.</div>
      )}
      {flanking.length > 0 && (
        <>
          <div style={DIVIDER} />
          <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted, marginBottom: 16 }}>{"\u25AA"} Flanking Moves</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {flanking.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "12px 0", borderBottom: i < flanking.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ fontFamily: t.fontBody, color: t.accentGreen, fontWeight: 700, fontSize: 13, minWidth: 90 }}>{f.attacker}</span>
                <span style={{ color: t.textFaint, fontFamily: t.fontMono, fontSize: 10 }}>{"\u2192"}</span>
                <span style={{ fontFamily: t.fontBody, color: t.danger, fontWeight: 600, fontSize: 13, minWidth: 130 }}>{f.target}</span>
                <span style={{ fontFamily: t.fontBody, color: t.textMuted, fontSize: 12 }}>{f.angle}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ ...GLASS, marginTop: 24, padding: "16px 20px", borderLeft: `2px solid ${t.accent}` }}>
        <div style={{ ...SECTION_LABEL(t), marginBottom: 6 }}>{"\u25AA"} Consolidation Watch</div>
        <div style={BODY_TEXT(t)}>
          Cognigy acquired by NICE ($955M) {"\u00b7"} Kustomer spun off from Meta ($250M) {"\u00b7"} Helpshift acquired by Keywords Studios ($75M) {"\u00b7"} Zendesk planning 2+ more acquisitions in 2026 {"\u00b7"} PE-backed Zendesk targeting IPO/sale within 3-5 years {"\u00b7"} Sprinklr market cap collapsed from $7B to $1.5B
        </div>
      </div>
    </div>
  );
}

// ── 6. HQ MAP (Leaflet) ──
function LeafletMapInner({ data, cityGroups, getDominantColor, t }) {
  const L = require("leaflet");
  const { MapContainer, TileLayer, CircleMarker, Tooltip: LTooltip } = require("react-leaflet");

  if (typeof window !== "undefined" && !document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  return (
    <MapContainer center={[30, 0]} zoom={2} minZoom={2} maxZoom={12} scrollWheelZoom={true} style={{ width: "100%", height: 520, borderRadius: 4, zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {cityGroups.map(city => {
        const r = 6 + Math.sqrt(city.companies.length) * 3;
        const color = getDominantColor(city.companies);
        return (
          <CircleMarker key={city.city} center={[city.lat, city.lng]} radius={r}
            pathOptions={{ fillColor: color, fillOpacity: 0.8, color: "rgba(255,255,255,0.3)", weight: 1 }}>
            <LTooltip direction="top" offset={[0, -r]} opacity={1}>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{city.city}</div>
                {city.companies.slice(0, 8).map(c => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[c.category] || "#e63926", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{c.category}</span>
                  </div>
                ))}
                {city.companies.length > 8 && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>+{city.companies.length - 8} more</div>
                )}
              </div>
            </LTooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

const LeafletMap = dynamic(() => Promise.resolve(LeafletMapInner), { ssr: false });

function HQMap({ data }) {
  const t = useTheme();
  const cityGroups = useMemo(() => {
    const groups = {};
    data.forEach(c => {
      const coords = CITY_COORDS[c.hq];
      if (!coords) return;
      if (!groups[c.hq]) groups[c.hq] = { ...coords, city: c.hq, companies: [] };
      groups[c.hq].companies.push(c);
    });
    return Object.values(groups);
  }, [data]);

  const getDominantColor = (companies) => {
    const counts = {};
    companies.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? CAT_COLORS[top[0]] || t.accent : t.accent;
  };

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} HQ Map</div>
      <h3 style={SECTION_HEADING(t)}>Global HQ Locations</h3>
      <p style={{ ...BODY_TEXT(t), marginBottom: 24 }}>{data.length} platforms across {cityGroups.length} cities. Click and drag to pan, scroll to zoom.</p>
      <LeafletMap data={data} cityGroups={cityGroups} getDominantColor={getDominantColor} t={t} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 20 }}>
        {Object.entries(CAT_COLORS).map(([cat, color]) => {
          const count = data.filter(c => c.category === cat).length;
          if (count === 0) return null;
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, opacity: 0.8 }} />
              <span style={{ fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted }}>{cat} ({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LATEST NEWS ──
const NEWS_CAT_COLORS = {
  funding: "#4ade80",
  feature: "#a78bfa",
  leadership: "#fbbf24",
  pivot: "#f472b6",
};

function truncateHeadline(headline, maxWords = 15) {
  if (!headline) return "";
  const words = headline.split(/\s+/);
  if (words.length <= maxWords) return headline;
  return words.slice(0, maxWords).join(" ") + "...";
}

function formatFullDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function NewsLine({ item, t }) {
  const [hovered, setHovered] = useState(false);
  const catColor = NEWS_CAT_COLORS[item.category] || t.textMuted;
  const truncated = truncateHeadline(item.headline);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
        borderBottom: `1px solid ${t.borderSubtle}`,
        transition: "background 0.15s",
        background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        marginLeft: -8, marginRight: -8, paddingLeft: 8, paddingRight: 8,
        borderRadius: 2,
      }}
    >
      {/* Category dot */}
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor, flexShrink: 0 }} />

      {/* Company tag */}
      <span style={{
        fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
        color: t.textMuted, flexShrink: 0, minWidth: 80,
      }}>
        {item.company}
      </span>

      {/* Headline with link */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: t.fontBody, fontSize: 13, color: t.text,
              textDecoration: "none", transition: "color 0.15s",
              ...(hovered ? { color: t.accent } : {}),
            }}
          >
            {truncated}
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.textFaint, marginLeft: 6 }}>{"\u2197"}</span>
          </a>
        ) : (
          <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text }}>{truncated}</span>
        )}
      </div>

      {/* Date tooltip on hover */}
      <div style={{
        fontFamily: t.fontMono, fontSize: 9, color: t.textFaint, whiteSpace: "nowrap",
        flexShrink: 0, letterSpacing: "0.05em",
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
        background: "rgba(20,20,20,0.9)", padding: "3px 8px", borderRadius: 2,
        border: `1px solid ${t.borderSubtle}`,
      }}>
        {formatFullDate(item.published_at)}
      </div>
    </div>
  );
}

function LatestNews() {
  const t = useTheme();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [collecting, setCollecting] = useState(false);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?category=${filter}` : "";
      const res = await fetch(`/api/intel${params}`);
      const data = await res.json();
      setUpdates(data.updates || []);
      setCategoryCounts(data.categoryCounts || {});
    } catch (e) {
      console.error("Failed to fetch intel:", e);
    } finally {
      setLoading(false);
    }
  };

  const runCollection = async (source) => {
    setCollecting(true);
    try {
      const res = await fetch(`/api/collect/${source}`);
      const data = await res.json();
      alert(`${source}: ${data.message || data.error}`);
      fetchUpdates();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setCollecting(false);
    }
  };

  useEffect(() => { fetchUpdates(); }, [filter]);

  const totalUpdates = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const cats = ["funding", "feature", "leadership", "pivot"];

  return (
    <div>
      <div style={SECTION_LABEL(t)}>{"\u25AA"} Latest News</div>
      <div style={SECTION_HEADING(t)}>Competitor News Feed</div>
      <p style={{ fontFamily: t.fontBody, fontSize: 13, color: t.textMuted, marginBottom: 28 }}>
        Auto-collected every 4-6 hours. Hover for dates, click headlines to read full articles.
      </p>

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em",
          color: filter === "all" ? t.text : t.textFaint, transition: "color 0.2s",
        }}>
          {filter === "all" && <span style={{ color: t.accent }}>{"\u25AA "}</span>}All ({totalUpdates})
        </button>
        {cats.map(cat => (
          <button key={cat} onClick={() => setFilter(filter === cat ? "all" : cat)} style={{
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em",
            color: filter === cat ? NEWS_CAT_COLORS[cat] : t.textFaint, transition: "color 0.2s",
          }}>
            {filter === cat && <span style={{ color: NEWS_CAT_COLORS[cat] }}>{"\u25AA "}</span>}
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Collect buttons */}
        <button onClick={() => runCollection("news")} disabled={collecting} style={{
          background: "transparent", border: `1px solid ${t.borderSubtle}`, borderRadius: 2, padding: "5px 12px",
          fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
          color: t.textMuted, cursor: collecting ? "wait" : "pointer", transition: "border-color 0.2s",
        }}>
          {collecting ? "..." : "Collect News"}
        </button>
        <button onClick={() => runCollection("rss")} disabled={collecting} style={{
          background: "transparent", border: `1px solid ${t.borderSubtle}`, borderRadius: 2, padding: "5px 12px",
          fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
          color: t.textMuted, cursor: collecting ? "wait" : "pointer", transition: "border-color 0.2s",
        }}>
          {collecting ? "..." : "Collect RSS"}
        </button>
      </div>

      {/* Divider */}
      <div style={{ borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: 4 }} />

      {/* News Feed */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textFaint, letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading...</div>
        </div>
      ) : updates.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 24, color: t.textFaint, marginBottom: 8 }}>No news yet</div>
          <p style={{ fontFamily: t.fontBody, fontSize: 13, color: t.textMuted, marginBottom: 16 }}>
            Click &quot;Collect News&quot; or &quot;Collect RSS&quot; above to start gathering headlines.
          </p>
          <p style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textFaint }}>
            Vercel cron jobs will auto-collect every 4-6 hours once deployed.
          </p>
        </div>
      ) : (
        <div>
          {updates.map((item, i) => (
            <NewsLine key={item.id || i} item={item} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ──
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dynamics");
  const [selectedCats, setSelectedCats] = useState([...ALL_CATEGORIES]);
  const t = THEME;

  const handleToggle = (cat) => {
    if (cat === "ALL") { setSelectedCats([...ALL_CATEGORIES]); return; }
    if (selectedCats.length === 1 && selectedCats[0] === cat) { setSelectedCats([...ALL_CATEGORIES]); }
    else { setSelectedCats([cat]); }
  };

  const filtered = useMemo(
    () => competitors.filter(c => selectedCats.includes(c.category)),
    [selectedCats]
  );

  const renderTab = () => {
    switch (activeTab) {
      case "matrix": return <PositioningMatrix data={filtered} />;
      case "revenue": return <RevenueFunding data={filtered} />;
      case "pricing": return <PricingModels data={filtered} />;
      case "aiPosture": return <AIMaturity data={filtered} />;
      case "dynamics": return <CompetitiveDynamics data={filtered} />;
      case "hqMap": return <HQMap data={filtered} />;
      case "latestNews": return <LatestNews />;
      default: return null;
    }
  };

  return (
    <ThemeContext.Provider value={t}>
      <div style={{ background: t.bg, minHeight: "100vh", fontFamily: t.fontBody, color: t.text }}>

        {/* Hero Section */}
        <div style={{
          position: "relative",
          backgroundImage: `url(${BG_IMAGES.hero})`,
          backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
          padding: "100px 0 60px",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.95) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: t.accent, marginBottom: 16 }}>
              {"\u25AA"} Botpress Competitive Intelligence
            </div>
            <h1 style={{ fontFamily: t.fontDisplay, fontSize: 52, fontWeight: 400, color: t.text, margin: 0, lineHeight: 1.1 }}>
              AI Customer Service
            </h1>
            <h1 style={{ fontFamily: t.fontDisplay, fontSize: 52, fontWeight: 400, color: t.text, margin: "0 0 16px", lineHeight: 1.1 }}>
              Competitive Landscape
            </h1>
            <p style={{ fontFamily: t.fontBody, fontSize: 15, color: t.textMuted, lineHeight: 1.7, maxWidth: 500 }}>
              {filtered.length} of {competitors.length} platforms {"\u00b7"} Revenue, pricing, AI maturity, and competitive dynamics
            </p>
          </div>
        </div>

        {/* Sticky Nav */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: t.textMuted, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: t.accent }}>{"\u25AA"}</span> Botpress
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
                  fontFamily: t.fontMono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em",
                  color: activeTab === tab.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                  transition: "color 0.2s",
                  borderBottom: activeTab === tab.id ? `1px solid ${t.accent}` : "1px solid transparent",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px" }}>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16 }}>
            <CategoryFilter selected={selectedCats} onToggle={handleToggle} />
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          position: "relative",
          backgroundImage: `url(${BG_IMAGES[activeTab] || BG_IMAGES.hero})`,
          backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
          padding: "60px 0 100px",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.95) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ ...GLASS, padding: "36px 40px" }}>
              {filtered.length > 0 ? renderTab() : (
                <div style={{ textAlign: "center", padding: 80, color: t.textMuted }}>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: 36, color: t.textFaint, marginBottom: 12 }}>No data</div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 14 }}>Select a category above to see platforms</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 60px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, textAlign: "center" }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", lineHeight: 2 }}>
              Data sourced from company filings, Crunchbase, G2, Gartner, Latka, press releases {"\u00b7"} Estimates flagged where applicable {"\u00b7"} March 2026
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
