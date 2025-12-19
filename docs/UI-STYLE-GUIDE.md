# UI Style Guide

This document defines the styling conventions for the algorithms-web-visualizations project. Follow these guidelines to maintain visual consistency across all visualizers.

## Color Palette

### Primary Colors
- **Cyan**: `#06b6d4` / `cyan-500` - Primary accent, speed sliders, play buttons
- **Indigo**: `#4f46e5` / `indigo-600` - Regenerate/build actions
- **Slate**: `#475569` / `slate-600` - Secondary actions (step, reset)

### Action Colors
- **Green**: `#16a34a` / `green-600` - Insert/add operations
- **Blue**: `#2563eb` / `blue-600` - Search operations
- **Red**: `#dc2626` / `red-600` - Delete operations
- **Amber**: `#d97706` / `amber-600` - Validate/warning actions

### Background Colors
- **Panel background**: `bg-slate-900/40`
- **Input background**: `bg-slate-800/50`
- **Visualization area**: `bg-[#0b1020]`
- **Border**: `border-slate-800` or `border-slate-700`

---

## Button Styles

### Play/Pause Button (Primary Action)
```tsx
className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
```
- Color: Solid cyan (`bg-cyan-600`)
- Hover: Lighter cyan (`hover:bg-cyan-500`)
- Text: White
- Label: "Play" when stopped, "Pause" when playing

### Step Button
```tsx
className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
```
- Color: Solid slate (`bg-slate-600`)
- Hover: Lighter slate (`hover:bg-slate-500`)

### Reset Button
```tsx
className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
```
- Same style as Step button

### Regenerate Button
```tsx
className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
```
- Color: Solid indigo (`bg-indigo-600`)
- Hover: Lighter indigo (`hover:bg-indigo-500`)
- Label: Always "Regenerate" (not "Generate Random", "Random Tree", etc.)

### Insert Button
```tsx
className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
```

### Search Button
```tsx
className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
```

### Delete Button
```tsx
className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
```

### Clear/Destructive Button (Secondary)
```tsx
className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
```
- Or for more emphasis:
```tsx
className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50"
```

---

## Button Layout Patterns

### Standard Animation Controls (3 buttons in a row)
```tsx
<div className="flex gap-2">
  <button className="flex-1 rounded-lg bg-cyan-600 ...">
    {isPlaying ? "Pause" : "Play"}
  </button>
  <button className="flex-1 rounded-lg bg-slate-600 ...">
    Step
  </button>
  <button className="flex-1 rounded-lg bg-slate-600 ...">
    Reset
  </button>
</div>
```

### Regenerate Button (Full width, separate row)
```tsx
<button className="w-full rounded-lg bg-indigo-600 ...">
  Regenerate
</button>
```

### Operation Buttons with Input
```tsx
<div className="flex gap-2">
  <input className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 ..." />
  <button className="rounded-lg bg-green-600 ...">Insert</button>
</div>
```

---

## Speed Slider

### Standard Speed Slider
```tsx
<div className="space-y-1">
  <label className="flex items-center justify-between text-xs text-slate-400">
    <span>Speed (ms)</span>
    <span className="text-cyan-400">{speed}</span>
  </label>
  <input
    type="range"
    min={50}
    max={800}
    value={speed}
    onChange={(e) => setSpeed(Number(e.target.value))}
    className="w-full accent-cyan-500"
  />
</div>
```

### Speed Slider Requirements
- **Range**: `min={50}` to `max={800}` milliseconds
- **Default value**: `300` ms (set in hooks via `useState(300)`)
- **Accent color**: `accent-cyan-500`
- **Value label color**: `text-cyan-400`
- **Label text color**: `text-slate-400`

---

## Input Fields

### Number Input
```tsx
<input
  type="number"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Value"
  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
/>
```

### Select Dropdown
```tsx
<select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200"
>
  <option value="option1">Option 1</option>
</select>
```

---

## Control Panel Structure

### Standard Controls Panel
```tsx
<div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200">
  {/* Header */}
  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>

  {/* Operation inputs (Insert, Search, Delete) */}
  <div className="space-y-2">
    <label className="text-xs text-slate-400">Insert</label>
    {/* Input + button */}
  </div>

  {/* Animation controls */}
  <div className="flex gap-2">
    {/* Play/Pause, Step, Reset buttons */}
  </div>

  {/* Regenerate button */}
  <button className="w-full rounded-lg bg-indigo-600 ...">Regenerate</button>

  {/* Speed slider */}
  <div className="space-y-1">
    {/* Speed control */}
  </div>

  {/* Statistics panel (if applicable) */}
  <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
    <h4 className="text-xs font-semibold text-slate-400">Statistics</h4>
    {/* Stats rows */}
  </div>

  {/* Clear button (at bottom) */}
  <button className="w-full rounded-lg border border-slate-600 ...">Clear</button>
</div>
```

---

## Statistics Panel

```tsx
<div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
  <h4 className="text-xs font-semibold text-slate-400">Statistics</h4>
  <div className="flex justify-between text-sm">
    <span className="text-slate-400">Size:</span>
    <span className="text-slate-200">{stats.size} nodes</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-slate-400">Height:</span>
    <span className="text-slate-200">{stats.height}</span>
  </div>
</div>
```

---

## Algorithm Selector Pills

### Category Badge
```tsx
<span className="rounded-full bg-cyan-500/30 px-3 py-1 text-cyan-100">Category</span>
```

Category colors:
- Sorting: `bg-fuchsia-500/30 text-fuchsia-100`
- Pathfinding: `bg-cyan-500/30 text-cyan-100`
- Graph: `bg-green-500/30 text-green-100`
- Data Structures: `bg-purple-500/30 text-purple-100`
- Machine Learning: `bg-amber-400/30 text-amber-100`
- Heap: `bg-green-500/30 text-green-100`
- Red-Black Tree: `bg-red-500/30 text-red-100`

### Algorithm Selection Button
```tsx
<button
  onClick={() => setAlgorithm(key)}
  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
    algorithm === key
      ? "border-cyan-400 bg-cyan-500/15 text-cyan-50"
      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"
  }`}
>
  {label}
</button>
```

---

## Animation Step Counter

```tsx
<div className="flex items-center justify-between text-xs text-slate-400">
  <span>Animation</span>
  <span>Step: {stepIndex + 1} / {totalSteps || 1}</span>
</div>
```

---

## Typography

### Section Headers
- Controls header: `text-xs uppercase tracking-[0.2em] text-slate-500`
- Stats header: `text-xs font-semibold text-slate-400`

### Labels
- Form labels: `text-xs text-slate-400`
- Value displays: `text-slate-200` or `text-cyan-400` for emphasis

### Body Text
- Primary: `text-sm text-slate-200`
- Secondary: `text-xs text-slate-400`
- Muted: `text-xs text-slate-500`

---

## Visualization Area

```tsx
<div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
  {/* Header info */}
  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
    <span>Steps: {stepIndex}</span>
    <span>Size: {size}</span>
    <span>Speed: {speed}ms</span>
  </div>

  {/* Canvas/SVG area */}
  <div className="relative w-full aspect-[4/3] max-h-[28rem] overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] p-3">
    {/* Visualization content */}
  </div>
</div>
```

---

## Responsive Layout

### Main Container
```tsx
<div className="flex flex-col gap-4">
  {/* Algorithm selector header */}

  <div className="flex flex-col gap-3 md:flex-row">
    {/* Visualization panel (flex-1) */}
    {/* Controls panel (w-full max-w-xs or md:w-80) */}
  </div>
</div>
```

---

## Common Patterns

### Auto-generate on Mount
For visualizers that should show data immediately:
```tsx
useEffect(() => {
  generateRandom();
}, []);
```

### Auto-generate on Type Change (e.g., Linked List)
```tsx
useEffect(() => {
  generateRandom(5);
}, [listType]);
```

### Play/Pause Toggle Pattern
```tsx
<button
  onClick={isPlaying ? pause : play}
  className="flex-1 rounded-lg bg-cyan-600 ..."
>
  {isPlaying ? "Pause" : "Play"}
</button>
```

Or with inline handler:
```tsx
<button
  onClick={isPlaying ? () => setIsPlaying(false) : handleRun}
  className="flex-1 rounded-lg bg-cyan-600 ..."
>
  {isPlaying ? "Pause" : "Play"}
</button>
```

---

## Checklist for New Visualizers

When creating a new visualizer, ensure:

- [ ] Play/Pause button uses `bg-cyan-600 hover:bg-cyan-500`
- [ ] Step/Reset buttons use `bg-slate-600 hover:bg-slate-500`
- [ ] Regenerate button uses `bg-indigo-600 hover:bg-indigo-500` and label is "Regenerate"
- [ ] Speed slider uses `accent-cyan-500` with range `50-800` and default `300`
- [ ] Speed value label uses `text-cyan-400`
- [ ] Insert uses `bg-green-600`, Search uses `bg-blue-600`, Delete uses `bg-red-600`
- [ ] Hook default speed is `useState(300)`
- [ ] Controls panel follows the standard structure
- [ ] Visualization auto-generates data on mount if appropriate
