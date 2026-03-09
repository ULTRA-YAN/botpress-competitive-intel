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
  { name: "Cognigy (NICE)", category: "AI-First", hq: "D\u00fcsseldorf, Germany", revenue: 40, revenueLabel: "~$40M (pre-acq est.)", aiPosture: "AI-First", pricingModel: "Enterprise subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "Acquired $955M", founded: 2016, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 6, automationDepth: 8 },
  { name: "Maven AGI", category: "AI-First", hq: "San Francisco, USA", revenue: 7, revenueLabel: "~$7M rev", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$78M raised", founded: 2023, automationRate: "93% claimed", customers: 40, aiScore: 9, marketBreadth: 3, automationDepth: 9 },
  { name: "Crescendo AI", category: "Managed Service", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M+ ARR (projected)", aiPosture: "AI-First", pricingModel: "Managed service", resolutionPrice: null, seatPrice: null, fundingOrVal: "$50M / $500M val", founded: 2024, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 4, automationDepth: 8 },
  { name: "Gorgias", category: "Specialist", hq: "San Francisco, USA", revenue: 71, revenueLabel: "$69-73M ARR", aiPosture: "Hybrid", pricingModel: "Ticket + Resolution", resolutionPrice: 0.90, seatPrice: null, fundingOrVal: "$96M raised", founded: 2015, automationRate: "N/A", customers: 15000, aiScore: 6, marketBreadth: 3, automationDepth: 7 },
  { name: "Gladly", category: "Specialist", hq: "San Francisco, USA", revenue: 48, revenueLabel: "$47.7M rev", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$208M raised", founded: 2014, automationRate: "N/A", customers: null, aiScore: 6, marketBreadth: 3, automationDepth: 6 },
  { name: "DevRev", category: "Specialist", hq: "Palo Alto, USA", revenue: 15, revenueLabel: "~$15M (est.)", aiPosture: "AI-First", pricingModel: "Issue-based", resolutionPrice: null, seatPrice: 25, fundingOrVal: "$150M+ / $1.15B val", founded: 2020, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 3, automationDepth: 7 },
  { name: "Helpshift", category: "Specialist", hq: "San Francisco, USA", revenue: 25, revenueLabel: "~$25M (est.)", aiPosture: "Hybrid", pricingModel: "Ticket-based", resolutionPrice: 0.90, seatPrice: null, fundingOrVal: "Acquired $75M", founded: 2011, automationRate: "N/A", customers: null, aiScore: 5, marketBreadth: 2, automationDepth: 6 },
  { name: "Polimorphic", category: "Specialist", hq: "San Francisco, USA", revenue: 5, revenueLabel: "~$5M (est.)", aiPosture: "AI-First", pricingModel: "Population-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$28M raised", founded: 2022, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 1, automationDepth: 7 },
  { name: "Kustomer", category: "Up-and-Coming", hq: "New York, USA", revenue: 35, revenueLabel: "~$35M (est.)", aiPosture: "AI-First", pricingModel: "Conversation-based", resolutionPrice: 0.60, seatPrice: 89, fundingOrVal: "$250M val (2023)", founded: 2015, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 5, automationDepth: 7 },
  { name: "Sprinklr", category: "Up-and-Coming", hq: "New York, USA", revenue: 796, revenueLabel: "$796M rev", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 249, fundingOrVal: "Public (NYSE: CXM)", founded: 2009, automationRate: "N/A", customers: null, aiScore: 6, marketBreadth: 7, automationDepth: 5 },
  { name: "Front", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 100, revenueLabel: "$100M ARR", aiPosture: "Leaning into AI", pricingModel: "Seat + Resolution", resolutionPrice: 0.70, seatPrice: 65, fundingOrVal: "$204M / $1.7B val", founded: 2013, automationRate: "N/A", customers: 9000, aiScore: 5, marketBreadth: 5, automationDepth: 5 },
  { name: "Dixa", category: "Up-and-Coming", hq: "Copenhagen, Denmark", revenue: 25, revenueLabel: "~$25M (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: 109, fundingOrVal: "$155M raised", founded: 2015, automationRate: "N/A", customers: null, aiScore: 5, marketBreadth: 4, automationDepth: 5 },
  { name: "Help Scout", category: "Up-and-Coming", hq: "Boston, USA", revenue: 36, revenueLabel: "$36M rev", aiPosture: "Leaning into AI", pricingModel: "Contacts-based", resolutionPrice: 0.75, seatPrice: null, fundingOrVal: "$14M raised", founded: 2011, automationRate: "N/A", customers: 12000, aiScore: 5, marketBreadth: 4, automationDepth: 4 },
  { name: "Tidio", category: "Up-and-Coming", hq: "Szczecin, Poland", revenue: 20, revenueLabel: "~$20M (est.)", aiPosture: "Hybrid", pricingModel: "Freemium + conversation", resolutionPrice: 0.50, seatPrice: 29, fundingOrVal: "$26.8M raised", founded: 2013, automationRate: "67% (Lyro)", customers: 300000, aiScore: 5, marketBreadth: 4, automationDepth: 5 },
  { name: "Pylon", category: "Up-and-Coming", hq: "San Francisco, USA", revenue: 10, revenueLabel: "~$10M (est.)", aiPosture: "Leaning into AI", pricingModel: "Seat-based", resolutionPrice: null, seatPrice: null, fundingOrVal: "$51M raised", founded: 2022, automationRate: "N/A", customers: 780, aiScore: 6, marketBreadth: 3, automationDepth: 5 },
  { name: "Parloa", category: "AI-First", hq: "Berlin, Germany", revenue: 15, revenueLabel: "~$15M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$96M raised", founded: 2018, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 4, automationDepth: 9 },
  { name: "Giga", category: "AI-First", hq: "Bangalore, India", revenue: 10, revenueLabel: "~$10M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$65M raised", founded: 2023, automationRate: "N/A", customers: null, aiScore: 9, marketBreadth: 2, automationDepth: 9 },
  { name: "Capacity", category: "Up-and-Coming", hq: "St. Louis, USA", revenue: 60, revenueLabel: "$60M ARR", aiPosture: "Hybrid", pricingModel: "Mid-market subscription", resolutionPrice: null, seatPrice: null, fundingOrVal: "$155M+ raised", founded: 2017, automationRate: "N/A", customers: 19000, aiScore: 5, marketBreadth: 5, automationDepth: 5 },
  { name: "Nurix AI", category: "AI-First", hq: "Bangalore, India", revenue: 3, revenueLabel: "~$3M (est.)", aiPosture: "AI-First", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$27.5M raised", founded: 2024, automationRate: "N/A", customers: null, aiScore: 8, marketBreadth: 2, automationDepth: 8 },
  { name: "Synthflow AI", category: "AI-First", hq: "Berlin, Germany", revenue: 8, revenueLabel: "~$8M (est.)", aiPosture: "AI-First", pricingModel: "Usage-based (minutes)", resolutionPrice: null, seatPrice: 29, fundingOrVal: "$30M raised", founded: 2023, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 4, automationDepth: 7 },
  { name: "Five9", category: "CCaaS / Contact Center", hq: "San Ramon, USA", revenue: 1150, revenueLabel: "$1.15B rev", aiPosture: "Leaning into AI", pricingModel: "Seat + per-minute AI", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NASDAQ: FIVN)", founded: 2001, automationRate: "N/A", customers: 3000, aiScore: 6, marketBreadth: 7, automationDepth: 5 },
  { name: "Genesys", category: "CCaaS / Contact Center", hq: "Menlo Park, USA", revenue: 2200, revenueLabel: "$2.2B Cloud ARR", aiPosture: "Leaning into AI", pricingModel: "Seat + AI consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "Private", founded: 1990, automationRate: "N/A", customers: 8000, aiScore: 7, marketBreadth: 9, automationDepth: 6 },
  { name: "IBM watsonx", category: "CCaaS / Contact Center", hq: "Armonk, USA", revenue: null, revenueLabel: "Part of IBM ($60B+)", aiPosture: "Leaning into AI", pricingModel: "Subscription + consumption", resolutionPrice: null, seatPrice: null, fundingOrVal: "Public (NYSE: IBM)", founded: 1911, automationRate: "N/A", customers: null, aiScore: 7, marketBreadth: 6, automationDepth: 6 },
  { name: "Yellow.ai", category: "AI-First", hq: "Bangalore, India", revenue: 80, revenueLabel: "$79.5M rev", aiPosture: "Hybrid", pricingModel: "Enterprise custom", resolutionPrice: null, seatPrice: null, fundingOrVal: "$102M+ raised", founded: 2016, automationRate: "N/A", customers: 1100, aiScore: 7, marketBreadth: 7, automationDepth: 7 },
];

// ── TABS ──
const TABS = [
  { id: "matrix", label: "Positioning Matrix" },
  { id: "revenue", label: "Revenue & Funding" },
  { id: "pricing", label: "Pricing Models" },
  { id: "aiPosture", label: "AI Maturity" },
  { id: "dynamics", label: "Competitive Dynamics" },
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
      <button
        onClick={() => onToggle("ALL")}
        style={{
          background: allSelected ? t.accent : "transparent",
          color: allSelected ? "#fff" : t.textMuted,
          border: `1px solid ${allSelected ? t.accent : t.border}`,
          borderRadius: 20, padding: "5px 14px",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        All ({competitors.length})
      </button>
      {ALL_CATEGORIES.map(cat => {
        const active = selected.includes(cat);
        const count = competitors.filter(c => c.category === cat).length;
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            style={{
              background: active ? CAT_COLORS[cat] + "22" : "transparent",
              color: active ? CAT_COLORS[cat] : t.textMuted,
              border: `1px solid ${active ? CAT_COLORS[cat] : t.border}`,
              borderRadius: 20, padding: "5px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: active ? CAT_COLORS[cat] : t.border,
              transition: "all 0.15s",
            }} />
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

// ── 1. POSITIONING MATRIX (with zoom) ──
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

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const pt = pixelToDomain(e.clientX, e.clientY);
    if (pt) { setDragStart(pt); setDragEnd(null); }
  };
  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const pt = pixelToDomain(e.clientX, e.clientY);
    if (pt) setDragEnd(pt);
  };
  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const x1 = Math.min(dragStart.x, dragEnd.x);
      const x2 = Math.max(dragStart.x, dragEnd.x);
      const y1 = Math.min(dragStart.y, dragEnd.y);
      const y2 = Math.max(dragStart.y, dragEnd.y);
      if (x2 - x1 > 0.3 && y2 - y1 > 0.3) {
        setZoom({ x: [Math.max(0, x1), Math.min(11, x2)], y: [Math.max(0, y1), Math.min(11, y2)] });
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const renderLabel = (props) => {
    const { x, y, value, index } = props;
    const item = chartData[index];
    if (!item) return null;
    return (
      <text x={x} y={y - 6} textAnchor="middle" fill={t.textMuted} fontSize={isZoomed ? 11 : 9} fontWeight={500} style={{ pointerEvents: "none" }}>
        {value}
      </text>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: t.text, margin: 0, fontSize: 18, fontWeight: 700 }}>Automation Depth vs. Market Breadth</h3>
          <p style={{ color: t.textMuted, margin: "4px 0 0", fontSize: 13 }}>
            Bubble size = log revenue. Showing {data.length} platforms. Drag to zoom.
          </p>
        </div>
        {isZoomed && (
          <button
            onClick={() => setZoom({ x: [0, 11], y: [0, 11] })}
            style={{
              background: t.accent, color: "#fff", border: "none", borderRadius: 6,
              padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Reset Zoom
          </button>
        )}
      </div>
      <div
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDragStart(null); setDragEnd(null); }}
        style={{ cursor: dragStart ? "crosshair" : "crosshair", userSelect: "none" }}
      >
        <ResponsiveContainer width="100%" height={560}>
          <ScatterChart margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis type="number" dataKey="x" domain={zoom.x} tick={{ fill: t.textMuted, fontSize: 11 }} label={{ value: "Market Breadth \u2192", position: "bottom", offset: 15, fill: t.textMuted, fontSize: 12 }} allowDataOverflow />
            <YAxis type="number" dataKey="y" domain={zoom.y} tick={{ fill: t.textMuted, fontSize: 11 }} label={{ value: "AI Automation Depth \u2192", angle: -90, position: "insideLeft", offset: -10, fill: t.textMuted, fontSize: 12 }} allowDataOverflow />
            <ZAxis type="number" dataKey="z" range={[40, 600]} />
            <Tooltip content={<TT />} />
            <Scatter data={chartData} isAnimationActive={false}>
              {chartData.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.category] || t.accent} fillOpacity={0.8} stroke={CAT_COLORS[e.category] || t.accent} strokeWidth={1} />)}
              <LabelList dataKey="name" content={renderLabel} />
            </Scatter>
            {dragStart && dragEnd && (
              <ReferenceArea
                x1={dragStart.x} x2={dragEnd.x}
                y1={dragStart.y} y2={dragEnd.y}
                stroke={t.accent} strokeOpacity={0.6}
                fill={t.accent} fillOpacity={0.1}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {[
          { label: "AI Leaders (High depth, Broad reach)", names: "Sierra, Intercom, Ada, Decagon", color: t.purple },
          { label: "Incumbents (Broad reach, Lower AI)", names: "Zendesk, Salesforce, ServiceNow, Microsoft", color: t.accent },
          { label: "AI Niche (High depth, Narrow)", names: "Parloa, Giga, Maven AGI, Nurix", color: t.pink },
          { label: "Traditional Niche", names: "Help Scout, Tidio, Dixa, Pylon", color: t.warning },
        ].map(q => (
          <div key={q.label} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${q.color}` }}>
            <div style={{ color: q.color, fontSize: 12, fontWeight: 600 }}>{q.label}</div>
            <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{q.names}</div>
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
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Revenue / ARR Comparison</h3>
      <p style={{ color: t.textMuted, margin: "0 0 16px", fontSize: 13 }}>Showing {top.length} platforms. Mix of public filings, reported ARR, and industry estimates.</p>
      <ResponsiveContainer width="100%" height={Math.max(top.length * 32, 200)}>
        <BarChart data={top} layout="vertical" margin={{ top: 5, right: 50, bottom: 5, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
          <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 11 }} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`} />
          <YAxis type="category" dataKey="name" tick={{ fill: t.text, fontSize: 12 }} width={110} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{d.name}</div>
                <div style={{ color: t.accent, fontSize: 13, marginTop: 4 }}>{d.revenueLabel}</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{d.fundingOrVal}</div>
                <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4 }}>{d.category}</div>
              </div>
            );
          }} />
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
  const pieColors = [t.accent, t.purple, t.pink, t.cyan, t.success, t.warning, t.orange, t.lime];
  const resData = data.filter(c => c.resolutionPrice).sort((a, b) => a.resolutionPrice - b.resolutionPrice).map(c => ({ name: c.name, price: c.resolutionPrice, category: c.category }));

  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Pricing Model Distribution</h3>
      <p style={{ color: t.textMuted, margin: "0 0 16px", fontSize: 13 }}>Showing {data.length} platforms.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie data={types.filter(p => p.count > 0)} dataKey="count" nameKey="model" cx="50%" cy="50%" outerRadius={130} innerRadius={60} paddingAngle={2} label={({ model, count }) => `${model} (${count})`} labelLine={{ stroke: t.textMuted }} style={{ fontSize: 11 }}>
                {types.filter(p => p.count > 0).map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Per-Resolution Price Comparison</div>
          {resData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                <XAxis dataKey="name" tick={{ fill: t.textMuted, fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} tickFormatter={v => `$${v.toFixed(2)}`} domain={[0, "auto"]} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`, "Per Resolution"]} contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {resData.map((e, i) => <Cell key={i} fill={e.name === "Zendesk" ? t.danger : e.name === "Ada" ? t.orange : e.name === "Intercom" ? t.warning : t.success} />)}
                  <LabelList dataKey="price" position="top" formatter={v => `$${v.toFixed(2)}`} style={{ fill: t.text, fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: t.textMuted, fontSize: 13, padding: 40, textAlign: "center" }}>No platforms with published per-resolution pricing in this selection.</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 16, background: t.surfaceHover, borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ color: t.warning, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Key Insight: The Seat vs. Resolution Tension</div>
        <div style={{ color: t.textMuted, fontSize: 12, lineHeight: 1.6 }}>
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
  const getColor = (s) => s >= 9 ? "#7c3aed" : s >= 7 ? "#3b82f6" : s >= 5 ? "#06b6d4" : s >= 3 ? "#f59e0b" : "#6b7280";
  const postureGroups = {};
  data.forEach(c => {
    if (!postureGroups[c.aiPosture]) postureGroups[c.aiPosture] = [];
    postureGroups[c.aiPosture].push(c.name);
  });

  return (
    <div>
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>AI Maturity Scorecard</h3>
      <p style={{ color: t.textMuted, margin: "0 0 16px", fontSize: 13 }}>Showing {data.length} platforms. Scored 1-10 on AI capability depth.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 6 }}>
        {sorted.map(c => (
          <div key={c.name} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 12px", borderLeft: `4px solid ${getColor(c.aiScore)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: t.text, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{c.name}</span>
              <span style={{ color: "#fff", background: getColor(c.aiScore), borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{c.aiScore}</span>
            </div>
            <span style={{ color: AI_COLORS[c.aiPosture] || t.textMuted, fontSize: 10 }}>{c.aiPosture}</span>
          </div>
        ))}
      </div>
      {Object.keys(postureGroups).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>AI Posture Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {Object.entries(postureGroups).map(([posture, names]) => (
              <div key={posture} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 14px", borderTop: `3px solid ${AI_COLORS[posture] || t.textMuted}` }}>
                <div style={{ color: AI_COLORS[posture] || t.textMuted, fontWeight: 600, fontSize: 13 }}>{posture} ({names.length})</div>
                <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{names.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
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
      <h3 style={{ color: t.text, margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Competitive Dynamics & Growth Trajectories</h3>
      <p style={{ color: t.textMuted, margin: "0 0 16px", fontSize: 13 }}>Showing {growthData.length} platforms with growth signals.</p>
      {growthData.length > 0 ? (
        <>
          <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Growth Momentum</div>
          <ResponsiveContainer width="100%" height={Math.max(growthData.length * 35, 120)}>
            <BarChart data={growthData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: t.textMuted, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: t.text, fontSize: 12 }} width={80} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontWeight: 700, color: t.text }}>{d.name}</div>
                    <div style={{ color: t.accent, fontSize: 12, marginTop: 2 }}>{d.signal}</div>
                    <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{d.detail}</div>
                  </div>
                );
              }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {growthData.map((e, i) => <Cell key={i} fill={e.score >= 8 ? t.success : e.score >= 5 ? t.warning : t.danger} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div style={{ color: t.textMuted, fontSize: 13, padding: 40, textAlign: "center" }}>No growth data for selected categories.</div>
      )}
      {flanking.length > 0 && (
        <>
          <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 10, marginTop: 20 }}>Flanking Moves</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {flanking.map((f, i) => (
              <div key={i} style={{ background: t.surfaceHover, borderRadius: 8, padding: "10px 14px", display: "grid", gridTemplateColumns: "100px 16px 140px 1fr", alignItems: "center", gap: 8 }}>
                <span style={{ color: t.success, fontWeight: 700, fontSize: 13 }}>{f.attacker}</span>
                <span style={{ color: t.textMuted }}>{"\u2192"}</span>
                <span style={{ color: t.danger, fontWeight: 600, fontSize: 13 }}>{f.target}</span>
                <span style={{ color: t.textMuted, fontSize: 12 }}>{f.angle}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ marginTop: 20, background: t.surfaceHover, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${t.danger}` }}>
        <div style={{ color: t.danger, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Consolidation Watch</div>
        <div style={{ color: t.textMuted, fontSize: 12, lineHeight: 1.6 }}>
          Cognigy acquired by NICE ($955M) {"\u00b7"} Kustomer spun off from Meta ($250M) {"\u00b7"} Helpshift acquired by Keywords Studios ($75M) {"\u00b7"} Zendesk planning 2+ more acquisitions in 2026 {"\u00b7"} PE-backed Zendesk targeting IPO/sale within 3-5 years {"\u00b7"} Sprinklr market cap collapsed from $7B to $1.5B
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ──
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [selectedCats, setSelectedCats] = useState([...ALL_CATEGORIES]);
  const [mode, setMode] = useState("dark");
  const t = mode === "dark" ? DARK : LIGHT;

  const handleToggle = (cat) => {
    if (cat === "ALL") {
      setSelectedCats([...ALL_CATEGORIES]);
      return;
    }
    if (selectedCats.length === 1 && selectedCats[0] === cat) {
      setSelectedCats([...ALL_CATEGORIES]);
    } else {
      setSelectedCats([cat]);
    }
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
      default: return null;
    }
  };

  return (
    <ThemeContext.Provider value={t}>
      <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: t.text, padding: "24px 28px", transition: "background 0.3s, color 0.3s" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />
              <span style={{ color: t.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Botpress Competitive Intelligence</span>
            </div>
            <button
              onClick={() => setMode(m => m === "dark" ? "light" : "dark")}
              style={{
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                color: t.text, fontSize: 13, fontWeight: 500, transition: "all 0.2s",
              }}
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span style={{ fontSize: 16 }}>{mode === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}</span>
              {mode === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 800, background: `linear-gradient(135deg, ${t.text}, ${t.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AI Customer Service — Competitive Landscape
          </h1>
          <p style={{ color: t.textMuted, fontSize: 13, margin: "6px 0 0" }}>
            {filtered.length} of {competitors.length} platforms {"\u00b7"} Revenue, pricing, AI maturity, and competitive dynamics
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter selected={selectedCats} onToggle={handleToggle} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.surface, borderRadius: 10, padding: 4, border: `1px solid ${t.border}` }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? t.accent : "transparent",
              color: activeTab === tab.id ? "#fff" : t.textMuted,
              border: "none", borderRadius: 8, padding: "8px 18px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: t.surface, borderRadius: 12, padding: "24px 28px", border: `1px solid ${t.border}` }}>
          {filtered.length > 0 ? renderTab() : (
            <div style={{ textAlign: "center", padding: 60, color: t.textMuted }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>&#128269;</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>No categories selected</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Click a category above to see platforms</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, color: t.textMuted, fontSize: 11, textAlign: "center" }}>
          Data sourced from company filings, Crunchbase, G2, Gartner, Latka, press releases {"\u00b7"} Estimates flagged where applicable {"\u00b7"} March 2026
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
