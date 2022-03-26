import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";

// TODO: Need to have a switch between devnet and mainnet
export function getConnectionString(): Connection {
    let _connection;
    let clusterName = String(process.env.NEXT_PUBLIC_CLUSTER_NAME);
    console.log("Cluster name is: ", clusterName);
    if (clusterName === "localnet") {
        let localClusterUrl = String(process.env.NEXT_PUBLIC_CLUSTER_URL);
        _connection = new Connection(localClusterUrl, 'confirmed');
    } else if (clusterName === "devnet") {
        _connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    } else if (clusterName === "testnet") {
        _connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
    } else if (clusterName === "mainnet") {
        _connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    } else {
        throw Error("Cluster is not defined properly! {$clusterName}");
    }
    return _connection;
}

export const BRAND_COLORS = {
    slate900: "#0f172a",
    slate700: "#334155",
    slate400: "#94a3b8",
    slate200: "#e2e8f0",
    neutral50: "#fafafa",
    pink700: "#be185d",
    // ping200: "",
}

let COLOR900 = [
// // 900
//     "#0f172a",
// // 900
//     "#111827",
// // 900
//     "#18181b",
// // 900
//     "#171717",
// // 900
//     "#1c1917",
// 900
    "#7f1d1d",
// 900
    "#7c2d12",
// 900
    "#78350f",
// 900
    "#713f12",
// 900
    "#365314",
// 900
    "#14532d",
// 900
    "#064e3b",
// 900
    "#134e4a",
// 900
    "#164e63",
// 900
    "#0c4a6e",
// 900
    "#1e3a8a",
// 900
    "#312e81",
// 900
    "#4c1d95",
// 900
    "#581c87",
// 900
    "#701a75",
// 900
    "#831843",
// 900
    "#881337"
]
let COLOR800 = [
// // 800
//     "#1e293b",
// // 800
//     "#1f2937",
// // 800
//     "#27272a",
// // 800
//     "#262626",
// // 800
//     "#292524",
// 800
    "#991b1b",
// 800
    "#9a3412",
// 800
    "#92400e",
// 800
    "#854d0e",
// 800
    "#3f6212",
// 800
    "#166534",
// 800
    "#065f46",
// 800
    "#115e59",
// 800
    "#155e75",
// 800
    "#075985",
// 800
    "#1e40af",
// 800
    "#3730a3",
// 800
    "#5b21b6",
// 800
    "#6b21a8",
// 800
    "#86198f",
// 800
    "#9d174d",
// 800
    "#9f1239"
]
let COLOR600 = [
// // 600
//     "#475569",
// // 600
//     "#4b5563",
// // 600
//     "#52525b",
// // 600
//     "#525252",
// // 600
//     "#57534e",
// 600
    "#dc2626",
// 600
    "#ea580c",
// 600
    "#d97706",
// 600
    "#ca8a04",
// 600
    "#65a30d",
// 600
    "#16a34a",
// 600
    "#059669",
// 600
    "#0d9488",
// 600
    "#0891b2",
// 600
    "#0284c7",
// 600
    "#2563eb",
// 600
    "#4f46e5",
// 600
    "#7c3aed",
// 600
    "#9333ea",
// 600
    "#c026d3",
// 600
    "#db2777",
// 600
    "#e11d48"
]

let COLOR500 = [
// // 500
//     "#64748b",
// // 500
//     "#6b7280",
// // 500
//     "#71717a",
// // 500
//     "#737373",
// // 500
//     "#78716c",
// 500
    "#ef4444",
// 500
    "#f97316",
// 500
    "#f59e0b",
// 500
    "#eab308",
// 500
    "#84cc16",
// 500
    "#22c55e",
// 500
    "#10b981",
// 500
    "#14b8a6",
// 500
    "#06b6d4",
// 500
    "#0ea5e9",
// 500
    "#3b82f6",
// 500
    "#6366f1",
// 500
    "#8b5cf6",
// 500
    "#a855f7",
// 500
    "#d946ef",
// 500
    "#ec4899",
// 500
    "#f43f5e"
]
let COLOR400 = [
// // 400
//     "#94a3b8",
// // 400
//     "#9ca3af",
// // 400
//     "#a1a1aa",
// // 400
//     "#a3a3a3",
// // 400
//     "#a8a29e",
// 400
    "#f87171",
// 400
    "#fb923c",
// 400
    "#fbbf24",
// 400
    "#facc15",
// 400
    "#a3e635",
// 400
    "#4ade80",
// 400
    "#34d399",
// 400
    "#2dd4bf",
// 400
    "#22d3ee",
// 400
    "#38bdf8",
// 400
    "#60a5fa",
// 400
    "#818cf8",
// 400
    "#a78bfa",
// 400
    "#c084fc",
// 400
    "#e879f9",
// 400
    "#f472b6",
// 400
    "#fb7185"
]
let COLOR300 = [
// // 300
//     "#cbd5e1",
// // 300
//     "#d1d5db",
// // 300
//     "#d4d4d8",
// // 300
//     "#d4d4d4",
// // 300
//     "#d6d3d1",
// 300
    "#fca5a5",
// 300
    "#fdba74",
// 300
    "#fcd34d",
// 300
    "#fde047",
// 300
    "#bef264",
// 300
    "#86efac",
// 300
    "#6ee7b7",
// 300
    "#5eead4",
// 300
    "#67e8f9",
// 300
    "#7dd3fc",
// 300
    "#93c5fd",
// 300
    "#a5b4fc",
// 300
    "#c4b5fd",
// 300
    "#d8b4fe",
// 300
    "#f0abfc",
// 300
    "#f9a8d4",
// 300
    "#fda4af"
]
let COLOR200 = [
// // 200
//     "#e2e8f0",
// // 200
//     "#e5e7eb",
// // 200
//     "#e4e4e7",
// // 200
//     "#e5e5e5",
// // 200
//     "#e7e5e4",
// 200
    "#fecaca",
// 200
    "#fed7aa",
// 200
    "#fde68a",
// 200
    "#fef08a",
// 200
    "#d9f99d",
// 200
    "#bbf7d0",
// 200
    "#a7f3d0",
// 200
    "#99f6e4",
// 200
    "#a5f3fc",
// 200
    "#bae6fd",
// 200
    "#bfdbfe",
// 200
    "#c7d2fe",
// 200
    "#ddd6fe",
// 200
    "#e9d5ff",
// 200
    "#f5d0fe",
// 200
    "#fbcfe8",
// 200
    "#fecdd3"
]
let COLOR100 = [
// // 100
//     "#f1f5f9",
// // 100
//     "#f3f4f6",
// // 100
//     "#f4f4f5",
// // 100
//     "#f5f5f5",
// // 100
//     "#f5f5f4",
// 100
    "#fee2e2",
// 100
    "#ffedd5",
// 100
    "#fef3c7",
// 100
    "#fef9c3",
// 100
    "#ecfccb",
// 100
    "#dcfce7",
// 100
    "#d1fae5",
// 100
    "#ccfbf1",
// 100
    "#cffafe",
// 100
    "#e0f2fe",
// 100
    "#dbeafe",
// 100
    "#e0e7ff",
// 100
    "#ede9fe",
// 100
    "#f3e8ff",
// 100
    "#fae8ff",
// 100
    "#fce7f3",
// 100
    "#ffe4e6"
]
let COLOR50 = [
// // 50
//     "#f8fafc",
// // 50
//     "#f9fafb",
// // 50
//     "#fafafa",
// // 50
//     "#fafafa",
// // 50
//     "#fafaf9",
// 50
    "#fef2f2",
// 50
    "#fff7ed",
// 50
    "#fffbeb",
// 50
    "#fefce8",
// 50
    "#f7fee7",
// 50
    "#f0fdf4",
// 50
    "#ecfdf5",
// 50
    "#f0fdfa",
// 50
    "#ecfeff",
// 50
    "#f0f9ff",
// 50
    "#eff6ff",
// 50
    "#eef2ff",
// 50
    "#f5f3ff",
// 50
    "#faf5ff",
// 50
    "#fdf4ff",
// 50
    "#fdf2f8",
// 50
    "#fff1f2"
]

// Slate

// Gray

// Zinc

// Neutral

// Stone

// Red

// Orange

// Amber

// Yellow

// Lime

// Green

// Emerald

// Teal

// Cyan

// Sky

// Blue

// Indigo

// Violet

// Purple

// Fuchsia

// Pink

// Rose

// All are from tailwind 3, the color for "slate-700" (index 700)
export const PIECHART_COLORS = [
    ...COLOR300
    // "#334155", // slate
    // "#374151", // gray
    // "#3f3f46", // zinc
    // "#404040", // neutral
    // "#44403c", // stone
    // "#b91c1c", // red
    // "#c2410c", // orange
    // "#b45309", // amber
    // "#a16207", // yellow
    // "#4d7c0f", // lime
    // "#15803d", // green
    // "#047857", // emerald
    // "#0f766e", // teal
    // "#0e7490", // cyan
    // "#0369a1", // sky
    // "#1d4ed8", // blue
    // "#4338ca", // indigo
    // "#6d28d9", // violet,
    // "#7e22ce", // purple
    // "#a21caf", // fuchsia
    // "#be185d", // pink
    // "#be123c", // rose
];
export const RADIAN = Math.PI / 180;
