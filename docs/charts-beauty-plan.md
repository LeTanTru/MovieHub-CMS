# Plan to Beautify Statistics Charts

This document outlines a visual and interactive redesign plan to make the charts in the `src/app/statistics` module feel premium, modern, and engaging.

---

## 1. Design Principles & Aesthetic Enhancements

### A. Cohesive Color Gradients (SVG Defs)

Instead of flat solid hex colors (`chartColors`), we will define linear gradients inside SVG `<defs>` blocks for every chart. This adds depth and a premium look.

| ID                | Gradient Name        | Colors                            | CSS Equiv                        |
| :---------------- | :------------------- | :-------------------------------- | :------------------------------- |
| **`colorBlue`**   | Sporty Blue / Indigo | `#1678ff` $\rightarrow$ `#6366f1` | `from-blue-500 to-indigo-500`    |
| **`colorGreen`**  | Emerald / Teal       | `#10b981` $\rightarrow$ `#059669` | `from-emerald-500 to-teal-600`   |
| **`colorOrange`** | Sunset / Amber       | `#f97316` $\rightarrow$ `#d97706` | `from-orange-500 to-amber-500`   |
| **`colorRed`**    | Rose / Coral         | `#f43f5e` $\rightarrow$ `#e11d48` | `from-rose-500 to-red-600`       |
| **`colorPurple`** | Violet / Fuchsia     | `#8b5cf6` $\rightarrow$ `#d946ef` | `from-violet-500 to-fuchsia-500` |
| **`colorCyan`**   | Cyan / Sky           | `#06b6d4` $\rightarrow$ `#0284c7` | `from-cyan-500 to-sky-600`       |

### B. Glassmorphism Custom Tooltips

Recharts default tooltips look basic and out of place. We will replace them with a custom React component styled with Tailwind:

- **Style**: Thin semi-transparent borders (`border-white/20`), backdrop blur (`backdrop-blur-md bg-white/85`), and smooth shadows (`shadow-lg`).
- **Content**: Bold values, clean labels, and colored indicator dots corresponding to the series gradients.

### C. Refined Axis and Grid Lines

- Set grid strokes to a low opacity (`stroke="oklch(var(--border) / 0.3)"` or `#e2e8f0` at `0.4` opacity) with dashed formatting (`strokeDasharray="4 4"`).
- Remove heavy axis border lines (`axisLine={false}`) and ticks (`tickLine={false}`).
- Use subtle typography for labels (`className="text-[11px] font-medium fill-zinc-400"`).

---

## 2. Component-Specific Redesign Plans

### A. Overview Dashboard (`src/app/statistics/overview`)

1. **Interactive Metric Cards**:
   - Apply subtle scale-on-hover (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`).
   - Use dynamic background patterns or glass effect overlays.
2. **"Tương tác nội dung" (Bar Chart)**:
   - Add SVG linear gradients matching the metric themes.
   - Apply rounded top borders to the bars: `radius={[8, 8, 0, 0]}`.
   - Enable active states (dim other bars to `opacity={0.6}` when hovering over a specific bar).
3. **"Cơ cấu phim" (Pie Chart)**:
   - Make the donut slices thinner (`innerRadius={70}`, `outerRadius={95}`).
   - Render a **center-stat summary** directly in the donut hole (e.g. showing "Tổng phim" count in bold, matching modern analytics dashboards).

---

### B. Movie Distribution (`src/app/statistics/movie-distribution`)

1. **Distribution Bar Chart**:
   - Set gradient colors.
   - Round the bar corners.
   - Add dynamic animations (`animationDuration={1500}`).
2. **Distribution Pie Chart**:
   - Make it a thin donut chart.
   - Render the currently hovered slice's percentage in the center hole of the donut.
   - Add slice-out active hover shapes.

---

### C. Top Movies (`src/app/statistics/top-movies`)

1. **Top Movies Horizontal Bar Chart**:
   - Set the chart to render horizontally with rounded end-edges (`radius={[0, 8, 8, 0]}`).
   - Add movie thumbnail preview on Tooltip hover.
   - Format ratings cleanly (e.g., showing a star icon in tooltip).
2. **Interactive Rankings Table**:
   - Add rank badges for the top 3 spots (Gold, Silver, Bronze color backgrounds) instead of plain numbers.
   - Clean up borders and row heights.

---

## 3. Implementation Workflow

### Step 1: Define Shared SVG Gradients

Add a reusable `<ChartGradients />` component or place `<defs>` blocks directly in chart renderers:

```tsx
export function ChartGradients() {
  return (
    <defs>
      <linearGradient id='colorBlue' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#1678ff' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#6366f1' stopOpacity={0.8} />
      </linearGradient>
      {/* ... repeat for other colors ... */}
    </defs>
  );
}
```

### Step 2: Implement Glass Custom Tooltip

```tsx
function CustomTooltip({
  active,
  payload,
  label
}: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className='rounded-xl border border-zinc-200/50 bg-white/80 p-3 shadow-lg backdrop-blur-md'>
      <p className='mb-1 text-xs font-semibold text-zinc-500'>{label}</p>
      <div className='flex items-center gap-2'>
        <span
          className='size-2 rounded-full'
          style={{ backgroundColor: payload[0].color }}
        />
        <span className='text-sm font-bold text-zinc-950'>
          {payload[0].value}
        </span>
      </div>
    </div>
  );
}
```

### Step 3: Polish Card Containers

Update all chart container cards to match Tailwind 4 visual aesthetics, removing plain borders and replacing them with modern cards with card headers and clean shadows.
